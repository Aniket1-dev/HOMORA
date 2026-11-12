import { useCallback, useEffect, useState } from "react";
import { entities } from "@/services/entities";
import ProfileWizard from "@/components/roommates/ProfileWizard";
import RoommateCard from "@/components/roommates/RoommateCard";
import EmptyState from "@/components/ui-bits/EmptyState";
import { compatibility } from "@/lib/roommateMatch";
import { useAuth } from "@/lib/AuthContext";
import { getRoommateContactEmails } from "@/services/bookings";
import { inr } from "@/lib/pricing";
import { CITIES } from "@/lib/constants";

const tabs = [
  { key: "discover", label: "Discover" },
  { key: "requests", label: "Requests" },
  { key: "profile", label: "My profile" },
];

export default function Roommates() {
  const { user } = useAuth();
  const [tab, setTab] = useState("discover");
  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const myProfile = (await entities.RoommateProfile.filter({ ownerId: user.id }, { limit: 1 })).items[0] || null;
    const emails = myProfile ? await getRoommateContactEmails().catch(() => ({})) : {};
    const withEmail = (record) => (record ? { ...record, contactEmail: emails[record.id] || record.contactEmail || "" } : record);
    setMine(withEmail(myProfile));

    if (myProfile) {
      const [profilePage, connectionPage] = await Promise.all([
        entities.RoommateProfile.filter({ paused: { $ne: true } }, { limit: 60 }),
        entities.RoommateConnection.filter(
          { $or: [{ fromProfileId: myProfile.id }, { toProfileId: myProfile.id }] },
          { limit: 100 }
        ),
      ]);
      setProfiles((profilePage?.items || []).filter((item) => item.id !== myProfile.id).map(withEmail));
      setConnections(connectionPage?.items || []);
    } else {
      setProfiles([]);
      setConnections([]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onSharedChange = (event) => {
      if (["roommate_profiles", "roommate_connections"].includes(event.detail?.table)) load();
    };
    window.addEventListener("homora:realtime-change", onSharedChange);
    return () => window.removeEventListener("homora:realtime-change", onSharedChange);
  }, [load]);

  const createProfile = async (payload) => {
    const created = await entities.RoommateProfile.create(payload);
    await load();
    setEditing(false);
    setTab("discover");
  };

  const updateProfile = async (payload) => {
    const updated = await entities.RoommateProfile.update(mine.id, payload);
    setMine({ ...updated, contactEmail: payload.contactEmail ?? mine.contactEmail });
    setEditing(false);
  };

  const connect = async (profile) => {
    await entities.RoommateConnection.create({
      fromProfileId: mine.id,
      fromName: mine.displayName,
      toProfileId: profile.id,
      toName: profile.displayName,
      status: "pending",
      message: `Hi ${profile.displayName.split(" ")[0]}, we look like a good match. Want to talk about sharing a place?`,
    });
    await load();
  };

  const respond = async (connection, status) => {
    await entities.RoommateConnection.update(connection.id, { status });
    await load();
  };

  const togglePause = async () => {
    const updated = await entities.RoommateProfile.update(mine.id, { paused: !mine.paused });
    setMine(updated);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!mine) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Roommate matching</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] sm:text-[34px]">Build your roommate profile</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Eight weighted factors decide your matches, and every score comes with the reasons behind it. You can pause or
          delete your profile at any time.
        </p>
        <div className="mt-8">
          <ProfileWizard onSubmit={createProfile} />
        </div>
      </div>
    );
  }

  const connectionFor = (profileId) =>
    connections.find(
      (connection) =>
        (connection.fromProfileId === mine.id && connection.toProfileId === profileId) ||
        (connection.toProfileId === mine.id && connection.fromProfileId === profileId)
    );

  const acceptedPartnerIds = connections
    .filter((connection) => connection.status === "accepted")
    .map((connection) => (connection.fromProfileId === mine.id ? connection.toProfileId : connection.fromProfileId));

  const matches = profiles
    .filter((profile) => !cityFilter || profile.city === cityFilter)
    .map((profile) => ({ profile, match: compatibility(mine, profile) }))
    .sort((a, b) => b.match.score - a.match.score);

  const incoming = connections.filter((connection) => connection.toProfileId === mine.id && connection.status === "pending");
  const outgoing = connections.filter((connection) => connection.fromProfileId === mine.id);
  const declined = connections.filter((connection) => connection.toProfileId === mine.id && connection.status === "rejected");
  const cities = [...new Set([...profiles.map((profile) => profile.city), ...CITIES])].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Roommate matching</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
            {mine.displayName.split(" ")[0]}'s matches
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {matches.filter((item) => item.match.compatible).length} compatible profiles ·{" "}
            {mine.paused ? "discovery paused" : "discovery visible"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-[13px]"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={togglePause}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground"
          >
            {mine.paused ? "Resume discovery" : "Pause discovery"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-full border border-border bg-card p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`flex-1 rounded-full px-3 py-2 text-[13px] transition ${
              tab === item.key ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"
            }`}
          >
            {item.label}
            {item.key === "requests" && incoming.length > 0 ? ` (${incoming.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "discover" && (
        <div className="mt-6">
          {matches.length === 0 ? (
            <EmptyState
              title="No roommate profiles in this city yet"
              body="Clear the city filter, or check back as more people join. Your profile stays visible to them."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {matches.map(({ profile, match }) => (
                <RoommateCard
                  key={profile.id}
                  profile={profile}
                  match={match}
                  connection={connectionFor(profile.id)}
                  onConnect={connect}
                  contactEmail={acceptedPartnerIds.includes(profile.id) ? profile.contactEmail : null}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-[15px] font-semibold">Waiting on you</h2>
            {incoming.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted-foreground">No incoming requests right now.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {incoming.map((connection) => (
                  <div key={connection.id} className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-[13px] font-medium">{connection.fromName}</p>
                    {connection.message && (
                      <p className="mt-1 text-[12px] text-muted-foreground">{connection.message}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => respond(connection, "accepted")}
                        className="rounded-xl bg-primary px-3.5 py-2 text-[12px] font-medium text-primary-foreground"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => respond(connection, "rejected")}
                        className="rounded-xl border border-border px-3.5 py-2 text-[12px]"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[15px] font-semibold">Sent by you</h2>
            {outgoing.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted-foreground">You haven't sent any requests yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {outgoing.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <span className="text-[13px]">{connection.toName}</span>
                    <span className="text-[12px] capitalize text-muted-foreground">{connection.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {declined.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold">Not accepted</h2>
              <div className="mt-3 space-y-2">
                {declined.map((connection) => (
                  <div key={connection.id} className="rounded-2xl border border-border bg-card px-4 py-3 text-[13px]">
                    <span className="text-muted-foreground">Request from {connection.fromName} was declined.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="mt-6">
          {editing ? (
            <ProfileWizard initial={mine} onSubmit={updateProfile} submitLabel="Save changes" />
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold">
                    {mine.displayName}
                    {mine.age ? `, ${mine.age}` : ""}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {mine.occupation} · {mine.locality ? `${mine.locality}, ` : ""}
                    {mine.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-border px-4 py-2 text-[13px]"
                >
                  Edit profile
                </button>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Budget", `${inr(mine.budgetMin || 0)} – ${inr(mine.budgetMax || 0)} per month`],
                  ["Move-in", mine.moveInDate || "Not set"],
                  ["Sleep schedule", mine.sleepSchedule?.replace(/_/g, " ")],
                  ["Cleanliness", mine.cleanliness],
                  ["Food habits", mine.foodHabit?.replace(/_/g, " ")],
                  ["Smoker", mine.smoker ? "Yes" : "No"],
                  ["Pets", mine.pets ? "Yes" : "No"],
                  ["Works from home", mine.wfh ? "Often" : "Rarely"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border px-3 py-2.5">
                    <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-[13px] capitalize">{value}</dd>
                  </div>
                ))}
              </dl>

              {mine.bio && <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{mine.bio}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}