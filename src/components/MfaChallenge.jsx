import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { verifyTotpChallenge } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";

export default function MfaChallenge({ factorId, returnTo = "/" }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (value = code) => {
    if (busy || value.length !== 6) return;
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
    <AuthLayout
      icon={ShieldCheck}
      title="Verify your identity"
      subtitle="Enter the 6-digit code from your authenticator app."
      topAction={
        <button type="button" onClick={() => { window.location.href = "/login"; }} className="inline-flex items-center gap-2 rounded-full border border-[#E8E2EF] bg-white px-4 py-2 text-[12px] font-semibold text-[#514A60] hover:bg-[#FAF8FF]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[17px] border border-[#E9E3F0] bg-white px-3 py-5 sm:px-5">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode} onComplete={verify} autoFocus autoComplete="one-time-code" inputMode="numeric">
              <InputOTPGroup className="gap-2 sm:gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} className="h-[52px] w-[42px] rounded-[13px] border border-[#E3DDEC] bg-[#FBFAFD] text-[19px] font-semibold text-[#211B35] shadow-none data-[active=true]:border-[#783DF0] sm:w-[49px]" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-[11px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          <Button className="mt-5 h-[53px] w-full rounded-[12px] bg-gradient-to-r from-[#854CF4] to-[#7134E8] text-[13px] font-semibold text-white" disabled={busy || code.length !== 6} onClick={() => verify()}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <>Verify & Continue <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
