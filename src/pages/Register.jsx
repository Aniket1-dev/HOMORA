import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Loader2, User, ShieldCheck, ArrowLeft } from "lucide-react";
import { signUp, verifySignUpCode, resendSignUpCode } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const inputClass =
  "h-[51px] rounded-[12px] border-[#E5DFEE] bg-[#FBFAFD] px-3.5 text-[13px] text-[#211B35] shadow-none transition placeholder:text-[#81778F] focus-visible:border-[#783DF0] focus-visible:ring-2 focus-visible:ring-[#783DF0]/15";
const labelClass = "text-[11px] font-semibold text-[#302A3B]";
const primaryButtonClass =
  "h-[53px] w-full rounded-[12px] bg-gradient-to-r from-[#854CF4] to-[#7134E8] text-[13px] font-semibold text-white shadow-[0_12px_24px_-14px_rgba(120,61,240,0.8)] transition hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-[#783DF0]/30 focus-visible:ring-offset-2";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const returnTo = safeReturnTo();
  const loginPath = "/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "");

  useEffect(() => {
    if (!showOtp || resendIn <= 0) return undefined;
    const timer = window.setTimeout(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [showOtp, resendIn]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, firstName.trim() + " " + lastName.trim());
      setShowOtp(true);
      setResendIn(30);
    } catch (err) {
      setError(err.message || "We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (value = otpCode) => {
    if (value.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      await verifySignUpCode(email.trim(), value);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "That code didn't work. Check it and try again.");
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendIn > 0) return;
    setError("");
    setResending(true);
    try {
      await resendSignUpCode(email.trim());
      setResendIn(30);
      toast({ title: "New code sent", description: "Check your inbox." });
    } catch (err) {
      setError(err.message || "We couldn't resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const backToDetails = () => {
    setShowOtp(false);
    setOtpCode("");
    setError("");
    setResendIn(0);
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={<>We've sent a 6-digit code to<br /><strong className="font-semibold text-[#211B35]">{email}</strong></>}
        topAction={
          <button type="button" onClick={backToDetails} className="inline-flex items-center gap-2 rounded-full border border-[#E8E2EF] bg-white px-4 py-2 text-[12px] font-semibold text-[#514A60] transition hover:border-[#D7C9F2] hover:bg-[#FAF8FF]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        }
        footer={
          <button type="button" onClick={backToDetails} className="font-semibold text-[#783DF0] underline-offset-4 hover:underline">
            Wrong email? Edit details
          </button>
        }
      >
        <div className="space-y-5">
          <div className="rounded-[17px] border border-[#E9E3F0] bg-[#FEFDFF] px-4 py-5 sm:px-5">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => { setOtpCode(value); setError(""); }}
                onComplete={handleVerify}
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
              >
                <InputOTPGroup className="gap-2 sm:gap-2.5">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-[54px] w-[43px] rounded-[13px] border border-[#E3DDEC] bg-white text-[20px] font-semibold text-[#211B35] shadow-none transition data-[active=true]:border-[#783DF0] data-[active=true]:ring-2 data-[active=true]:ring-[#783DF0]/10 sm:w-[49px]"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-[11px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] leading-5 text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <Button className={primaryButtonClass + " mt-5"} onClick={() => handleVerify()} disabled={loading || otpCode.length !== 6}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <>Verify & Continue <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendIn > 0}
              className="text-[12px] font-medium text-[#6D657B] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Didn't receive the code?{" "}
              <span className="font-semibold text-[#783DF0]">
                {resending ? "Sending..." : resendIn > 0 ? "Resend in 00:" + String(resendIn).padStart(2, "0") : "Resend code"}
              </span>
            </button>
            <p className="flex items-center gap-2 text-[11px] text-[#777087]">
              <ShieldCheck className="h-4 w-4 text-[#00A991]" />
              Your code is private. Never share it with anyone.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={User}
      title="Create your account"
      subtitle="Join HOMORA Discover and find a place that truly feels like home."
      footer={
        <>
          Already have an account?{" "}
          <Link to={loginPath} className="font-semibold text-[#783DF0] underline-offset-4 hover:underline">Log in</Link>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className={labelClass}>First name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82788F]" aria-hidden="true" />
                <Input id="firstName" type="text" autoComplete="given-name" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClass + " pl-10"} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className={labelClass}>Last name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82788F]" aria-hidden="true" />
                <Input id="lastName" type="text" autoComplete="family-name" placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClass + " pl-10"} required />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelClass}>Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82788F]" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass + " pl-10"} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelClass}>Create password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82788F]" aria-hidden="true" />
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass + " pl-10 pr-11"} required minLength={8} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#766D83] hover:bg-[#F0ECF6]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] leading-4 text-[#81788D]">Use at least 8 characters.</p>
          </div>

          <Button type="submit" className={primaryButtonClass} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="pt-1 text-center text-[10px] leading-5 text-[#777087]">
          By creating an account, you agree to use HOMORA Discover responsibly and keep your account information accurate.
        </p>
      </div>
    </AuthLayout>
  );
}
