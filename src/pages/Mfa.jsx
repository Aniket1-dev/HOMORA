import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { confirmTotpEnrollment, enrollTotp, listTotpFactors, removeTotpFactor } from "@/lib/auth";

// /mfa - two-step verification settings (authenticator app). SMS codes are not offered.
export default function Mfa() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [factors, setFactors] = useState(null);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => listTotpFactors().then((all) => setFactors(all.filter((f) => f.status === "verified"))).catch((e) => setError(e.message));

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated]);

  const start = async () => {
    setError("");
    setBusy(true);
    try {
      setSetup(await enrollTotp());
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const confirm = async () => {
    setError("");
    setBusy(true);
    try {
      await confirmTotpEnrollment(setup.factorId, code);
      setSetup(null);
      setCode("");
      await refresh();
    } catch (e) {
      setError(e.message || "That code didn't work.");
    }
    setBusy(false);
  };

  const remove = async (id) => {
    setError("");
    try {
      await removeTotpFactor(id);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoadingAuth) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!isAuthenticated) {
    return <div className="min-h-screen grid place-items-center text-sm">Please <Link className="mx-1 text-primary underline" to="/login?returnTo=/mfa">log in</Link> to manage two-step verification.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-sm border border-border p-8 space-y-5">
        <div className="text-center space-y-1">
          <ShieldCheck className="w-8 h-8 mx-auto text-primary" />
          <h1 className="text-xl font-semibold">Two-step verification</h1>
          <p className="text-sm text-muted-foreground">Protect your account with an authenticator app.</p>
        </div>
        {error && <div role="alert" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        {setup ? (
          <div className="space-y-4 session-record-block">
            <p className="text-sm">Scan this QR code with your authenticator app, then enter the 6-digit code.</p>
            <img src={setup.qrCode} alt="Authenticator QR code" className="mx-auto h-44 w-44" />
            <p className="text-center text-xs text-muted-foreground break-all">Or enter this key: {setup.secret}</p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode} onComplete={confirm}>
                <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full" disabled={busy || code.length < 6} onClick={confirm}>Confirm</Button>
          </div>
        ) : factors === null ? (
          <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : factors.length ? (
          <div className="space-y-3">
            {factors.map((factor) => (
              <div key={factor.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <span>Authenticator app</span>
                <Button variant="outline" size="sm" onClick={() => remove(factor.id)}>Remove</Button>
              </div>
            ))}
          </div>
        ) : (
          <Button className="w-full h-12" disabled={busy} onClick={start}>Set up authenticator app</Button>
        )}
        <div className="text-center"><Link to="/account" className="text-sm text-muted-foreground hover:underline">Back to account</Link></div>
      </div>
    </div>
  );
}
