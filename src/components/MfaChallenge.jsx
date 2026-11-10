import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck } from "lucide-react";
import { verifyTotpChallenge } from "@/lib/auth";

// Second sign-in step for accounts with an authenticator app enrolled.
export default function MfaChallenge({ factorId, returnTo = "/" }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (value = code) => {
    if (busy || value.length < 6) return;
    setError("");
    setBusy(true);
    try {
      await verifyTotpChallenge(factorId, value);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "That code didn't work. Try again.");
      setCode("");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1F7] text-[#211B35] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E7E2EB] p-8 space-y-5">
        <div className="text-center space-y-1">
          <ShieldCheck className="w-8 h-8 mx-auto text-primary" />
          <h1 className="text-xl font-semibold">Verify your identity</h1>
          <p className="text-sm text-[#6B6279]">Enter the 6-digit code from your authenticator app.</p>
        </div>
        {error && <div role="alert" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} onComplete={verify} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" disabled={busy || code.length < 6} onClick={() => verify()}>
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {busy ? "Verifying..." : "Verify"}
        </Button>
        <div className="text-center">
          <a href="/login" className="text-sm text-muted-foreground hover:underline">Back to log in</a>
        </div>
      </div>
    </div>
  );
}
