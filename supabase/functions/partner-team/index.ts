import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://homora-admin.vercel.app",
  "https://homorodemo.vercel.app",
  "https://homora-partner-connected.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = allowedOrigins.has(origin)
    || /^https:\/\/(?:homora-admin|homorodemo|homora-partner-connected)(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin)
    ? origin
    : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req);
  const send = (body: unknown, status = 200) => json(body, status, headers);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return send({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("partner-team is missing required Supabase environment variables");
    return send({ error: "Team service is not configured" }, 503);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return send({ error: "Authentication required" }, 401);

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return send({ error: "Invalid session" }, 401);

  try {
    const body = await req.json();
    const accountId = String(body.account_id || "");
    const action = String(body.action || "invite");
    if (!UUID.test(accountId)) return send({ error: "A valid partner account is required" }, 400);

    const { data: inviterMembership, error: membershipError } = await admin
      .from("partner_memberships")
      .select("role,status")
      .eq("partner_account_id", accountId)
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (!inviterMembership || inviterMembership.role !== "account_owner") {
      return send({ error: "Only the account owner can manage team access" }, 403);
    }

    if (action === "update_role" || action === "remove") {
      const membershipId = String(body.membership_id || "");
      if (!UUID.test(membershipId)) return send({ error: "A valid membership is required" }, 400);

      const { data: target, error: targetError } = await admin
        .from("partner_memberships")
        .select("id,role")
        .eq("id", membershipId)
        .eq("partner_account_id", accountId)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!target) return send({ error: "Team member not found" }, 404);
      if (target.role === "account_owner") {
        return send({ error: "The account owner cannot be changed or removed here" }, 403);
      }

      if (action === "update_role") {
        const role = String(body.role || "");
        if (!["manager", "listing_manager", "booking_manager", "viewer"].includes(role)) {
          return send({ error: "Invalid team role" }, 400);
        }
        const { error } = await admin.from("partner_memberships")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", membershipId)
          .eq("partner_account_id", accountId);
        if (error) throw error;
        return send({ ok: true, action: "role_updated" });
      }

      const { error } = await admin.from("partner_memberships")
        .delete()
        .eq("id", membershipId)
        .eq("partner_account_id", accountId);
      if (error) throw error;
      return send({ ok: true, action: "member_removed" });
    }

    if (action !== "invite") return send({ error: "Unsupported team action" }, 400);

    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim().slice(0, 120);
    const role = String(body.role || "manager");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return send({ error: "A valid email address is required" }, 400);
    }
    if (!["manager", "listing_manager", "booking_manager", "viewer"].includes(role)) {
      return send({ error: "Unsupported team role" }, 400);
    }

    let existingUser = null;
    for (let page = 1; page <= 20 && !existingUser; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      existingUser = data.users.find((candidate) => candidate.email?.toLowerCase() === email) || null;
      if (data.users.length < 1000) break;
    }

    if (existingUser) {
      const { data: current, error: currentError } = await admin
        .from("partner_memberships")
        .select("role")
        .eq("partner_account_id", accountId)
        .eq("user_id", existingUser.id)
        .maybeSingle();
      if (currentError) throw currentError;
      if (current?.role === "account_owner") {
        return send({ error: "This person is the account owner and already has full access." }, 400);
      }
      const { error } = await admin.from("partner_memberships").upsert({
        partner_account_id: accountId,
        user_id: existingUser.id,
        user_email: email,
        user_name: name || existingUser.user_metadata?.full_name || null,
        role,
        status: "active",
        invited_by: userData.user.id,
      }, { onConflict: "partner_account_id,user_id" });
      if (error) throw error;
      return send({ ok: true, invitedUserExists: true, message: "Existing HOMORA user added to the Partner account." });
    }

    const { error: invitationError } = await admin.from("partner_invitations").upsert({
      partner_account_id: accountId,
      email,
      name: name || null,
      role,
      invited_by: userData.user.id,
      status: "invited",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "partner_account_id,email" });
    if (invitationError) throw invitationError;

    const redirectTo = Deno.env.get("PARTNER_APP_URL") || "https://homora-partner-connected.vercel.app";
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name },
      redirectTo,
    });
    if (inviteError) {
      await admin.from("partner_invitations")
        .delete().eq("partner_account_id", accountId).eq("email", email).eq("status", "invited");
      throw inviteError;
    }

    return send({ ok: true, invitedUserExists: false, message: "Invitation email sent. Membership activates after account verification." });
  } catch (error) {
    console.error("partner-team action failed", error);
    return send({ error: error instanceof Error ? error.message : "Unable to update the team" }, 400);
  }
});
