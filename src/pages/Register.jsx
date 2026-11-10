import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { signUp, verifySignUpCode, resendSignUpCode, signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const inputClass =
  "h-[54px] rounded-[13px] border-[#E7E2EB] bg-[#FCFBFD] px-4 pr-11 text-[14px] text-[#211B35] shadow-none transition placeholder:text-[#AAA3B4] focus-visible:border-[#783DF0] focus-visible:ring-2 focus-visible:ring-[#783DF0]/15 dark:border-[#393245] dark:bg-[#1C1825] dark:text-[#F5F1FA] dark:placeholder:text-[#827A90]";
const labelClass = "text-[12px] font-semibold text-[#41394F] dark:text-[#DAD4E5]";
const primaryButtonClass =
  "h-[54px] w-full rounded-[13px] bg-[#783DF0] text-[14px] font-semibold text-white shadow-[0_9px_20px_-13px_rgba(120,61,240,0.82)] transition hover:-translate-y-0.5 hover:bg-[#6C32E4] focus-visible:ring-2 focus-visible:ring-[#783DF0]/30 focus-visible:ring-offset-2";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (password !== confirmPassword) return setError("Your passwords don't match. Please check them and try again.");
    setLoading(true);
    try {
      await signUp(email.trim(), password);
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

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle(returnTo);
    } catch (err) {
      setError(err.message || "Unable to continue with Google.");
      setGoogleLoading(false);
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        title="Check your inbox."
        subtitle="One last step before you find a place to call home."
        footer={
          <>
            Wrong email address?{" "}
            <button type="button" onClick={() => { setShowOtp(false); setOtpCode(""); setError(""); setResendIn(0); }}
              className="font-semibold text-[#783DF0] underline-offset-4 hover:underline dark:text-[#BFA6FF]">
              Edit email
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-[13px] border border-[#EAE4F5] bg-[#FAF8FF] px-4 py-3.5 dark:border-[#3A314C] dark:bg-[#211A2D]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEE7FF] text-[#783DF0] dark:bg-[#34264C] dark:text-[#C7B3FF]">
              <Mail className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#91879F]">Code sent to</p>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-[#30283D] dark:text-[#F2EDF8]">{email}</p>
            </div>
            <span className="ml-auto shrink-0 text-[10px] font-medium text-[#00A58F]">EMAIL</span>
          </div>

          <div className="space-y-4 rounded-[16px] border border-[#EAE4F5] bg-white p-5 dark:border-[#3A314C] dark:bg-[#1C1825] sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EAFE] text-[#783DF0] dark:bg-[#34264C] dark:text-[#C7B3FF]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[14px] font-semibold text-[#30283D] dark:text-[#F2EDF8]">Enter your 6-digit code</p>
              <p className="mt-1 text-[11px] leading-5 text-[#92899F] dark:text-[#A69CB8]">Check your inbox and enter the code below.</p>
            </div>

            <div className="flex justify-center py-1">
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
                    <InputOTPSlot key={index} index={index}
                      className="h-[48px] w-[42px] rounded-[11px] border border-[#E4DDEE] bg-[#FCFBFE] text-[18px] font-semibold text-[#30283D] shadow-none transition data-[active=true]:border-[#783DF0] dark:border-[#4A405B] dark:bg-[#17131F] dark:text-white sm:h-[54px] sm:w-[48px]" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button className={primaryButtonClass} onClick={() => handleVerify()} disabled={loading || otpCode.length !== 6}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <>Verify email <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={handleResend} disabled={resending || resendIn > 0}
              className="text-[12px] font-semibold text-[#783DF0] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-[#A59AB8] dark:text-[#BFA6FF] dark:disabled:text-[#777084]">
              {resending ? "Sending a new code..." : resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, "0")}` : "Didn't receive a code? Resend"}
            </button>
            <p className="flex items-center gap-1.5 text-[10px] text-[#A29AAA] dark:text-[#81788F]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00A991]" /> Never share your verification code with anyone.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Make yourself at home."
      subtitle="Create your account and discover a place that fits the way you live."
      footer={
        <>
          Already have an account?{" "}
          <Link to={loginPath} className="font-semibold text-[#783DF0] underline-offset-4 hover:underline dark:text-[#BFA6FF]">Sign in</Link>
        </>
      }
    >
      <div className="space-y-4">
        <Button type="button" variant="outline" disabled={loading || googleLoading} onClick={handleGoogle}
          className="h-[53px] w-full rounded-[13px] border-[#E7E2EB] bg-white text-[13px] font-semibold text-[#332B40] shadow-none transition hover:border-[#D4C5F5] hover:bg-[#FAF8FF] dark:border-[#393245] dark:bg-[#1C1825] dark:text-[#F2EDF8] dark:hover:bg-[#282233]">
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-[18px] w-[18px]" />}
          Sign up with Google
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#ECE8F1] dark:bg-[#393245]" />
          <span className="text-[10px] font-semibold tracking-[0.16em] text-[#A19AAA]">OR WITH EMAIL</span>
          <div className="h-px flex-1 bg-[#ECE8F1] dark:bg-[#393245]" />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelClass}>Email address</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email}
              onChange={(event) => setEmail(event.target.value)} className={inputClass} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelClass}>Create password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} required minLength={8} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#92899F] hover:bg-[#F0ECF6] dark:hover:bg-[#302A3A]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className={labelClass}>Confirm password</Label>
            <div className="relative">
              <Input id="confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} required minLength={8} />
              <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#92899F] hover:bg-[#F0ECF6] dark:hover:bg-[#302A3A]">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className={primaryButtonClass} disabled={loading || googleLoading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your account...</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="pt-1 text-center text-[11px] leading-5 text-[#9A93A5] dark:text-[#8E859C]">
          Your information is protected and only used to manage your HOMORA Discover account.
        </p>
      </div>
    </AuthLayout>
  );
}
