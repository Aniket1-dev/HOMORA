import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { setNewPassword as saveNewPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [recoveryState, setRecoveryState] = useState("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription;

    const establishRecoverySession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const authError = params.get("error_description") || hashParams.get("error_description");
        if (authError) throw new Error(authError.replace(/\+/g, " "));

        // Supabase may deliver a PKCE code or a token_hash depending on the email template.
        // The client auto-detects hash tokens; handle PKCE/token_hash explicitly as a fallback.
        let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const code = params.get("code");
        if (!sessionData.session && code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          if (result.error) throw result.error;
          sessionData = result.data;
        }

        const tokenHash = params.get("token_hash");
        const type = params.get("type");
        if (!sessionData.session && tokenHash && type === "recovery") {
          const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (result.error) throw result.error;
          sessionData = result.data;
        }

        if (!sessionData.session) {
          // Allow the auth client a moment to finish processing a hash-based recovery URL.
          await new Promise((resolve) => setTimeout(resolve, 350));
          const retry = await supabase.auth.getSession();
          if (retry.error) throw retry.error;
          sessionData = retry.data;
        }

        if (!sessionData.session) throw new Error("This reset link is invalid or expired. Request a new one.");
        if (active) {
          setRecoveryState("ready");
          // Remove one-time credentials from the visible URL after Supabase has established the session.
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "This reset link is invalid or expired. Request a new one.");
          setRecoveryState("invalid");
        }
      }
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) setRecoveryState("ready");
    });
    subscription = data.subscription;
    establishRecoverySession();

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await saveNewPassword(newPassword);
      setUpdated(true);
    } catch (err) {
      setError(err?.message || "Failed to update your password. Request a new reset link and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (recoveryState === "checking") {
    return (
      <AuthLayout icon={Lock} title="Verifying reset link" subtitle="Please wait while we securely verify your link">
        <div className="flex justify-center py-5"><Loader2 className="w-6 h-6 animate-spin" /></div>
      </AuthLayout>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Reset link unavailable"
        subtitle="This password reset link could not be verified"
        footer={<Link to="/forgot-password" className="text-primary font-medium hover:underline">Request a new reset link</Link>}
      >
        <p role="alert" className="text-sm text-destructive text-center">{error}</p>
      </AuthLayout>
    );
  }

  if (updated) {
    return (
      <AuthLayout
        icon={CheckCircle2}
        title="Password updated"
        subtitle="Your HOMORA password has been changed successfully"
        footer={<Link to="/login" className="text-primary font-medium hover:underline">Continue to login</Link>}
      >
        <p className="text-sm text-foreground text-center">You can now sign in with your new password on Discover, Partner and Admin.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Lock} title="Choose a new password" subtitle="Create a new password for your HOMORA account">
      {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" autoFocus placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 h-12" minLength={8} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" minLength={8} required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating password...</> : "Save new password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
