import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  UserPlus,
} from "lucide-react";
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
  "h-[54px] rounded-[15px] border-[#E8E3EF] bg-[#FCFBFE] pl-11 pr-12 text-[14px] text-[#211B35] shadow-none transition placeholder:text-[#AAA3B4] focus-visible:border-[#783DF0] focus-visible:ring-2 focus-visible:ring-[#783DF0]/15 dark:border-[#393245] dark:bg-[#1C1825] dark:text-[#F5F1FA] dark:placeholder:text-[#827A90]";
const labelClass = "text-[12px] font-semibold tracking-[0.01em] text-[#41394F] dark:text-[#DAD4E5]";
const primaryButtonClass =
  "h-[54px] w-full rounded-[15px] bg-[#783DF0] text-[14px] font-semibold text-white shadow-[0_12px_24px_-13px_rgba(120,61,240,0.85)] transition hover:-translate-y-0.5 hover:bg-[#6C32E4] hover:shadow-[0_16px_28px_-14px_rgba(120,61,240,0.9)] focus-visible:ring-2 focus-visible:ring-[#783DF0]/30 focus-visible:ring-offset-2";

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
  const returnTo = safeReturnTo();
  const loginPath = "/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Your passwords don't match. Please check them and try again.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      await verifySignUpCode(email.trim(), otpCode);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "That code didn't work. Check it and try again.");
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setError("");
    setResending(true);
    try {
      await resendSignUpCode(email.trim());
      toast({ title: "New code sent", description: "Check your inbox and spam folder." });
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
        icon={Mail}
        title="Check your inbox."
        subtitle={<>We sent a 6-digit verification code to <strong className="font-semibold text-[#342B45] dark:text-white">{email}</strong>.</>}
        footer={
          <>
            Wrong email address?{" "}
            <button
              type="button"
              onClick={() => { setShowOtp(false); setOtpCode(""); setError(""); }}
              className="font-semibold text-[#783DF0] underline-offset-4 hover:underline dark:text-[#BFA6FF]"
            >
              Edit email
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-[18px] border border-[#EAE4F5] bg-[#FAF8FF] p-5 dark:border-[#3A314C] dark:bg-[#211A2D]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE7FF] text-[#783DF0] dark:bg-[#34264C] dark:text-[#C7B3FF]">
                <Mail className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#30283D] dark:text-[#F2EDF8]">Verify your email</p>
                <p className="mt-0.5 text-[11px] text-[#8D849C] dark:text-[#A69CB8]">Enter the code to activate your account.</p>
              </div>
            </div>
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                autoFocus
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-12 w-10 rounded-xl border-[#DED5EF] bg-white text-[17px] font-semibold text-[#34264B] shadow-sm dark:border-[#4A405B] dark:bg-[#17131F] dark:text-white sm:h-[54px] sm:w-12"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#92899F] dark:text-[#A69CB8]">Check your inbox, promotions and spam folders.</p>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-[13px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className={primaryButtonClass}
            onClick={handleVerify}
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <>Verify email <ArrowRight className="h-4 w-4" /></>}
          </Button>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[12px] font-semibold text-[#783DF0] underline-offset-4 hover:underline disabled:opacity-50 dark:text-[#BFA6FF]"
            >
              {resending ? "Sending a new code..." : "Didn't receive the code? Resend"}
            </button>
            <p className="inline-flex items-center gap-1.5 text-[10px] text-[#A29AAA] dark:text-[#81788F]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00A991]" /> Your email is only used to secure your account.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Make yourself at home."
      subtitle="Create your account and find a place that fits the way you live."
      footer={
        <>
          Already have an account?{" "}
          <Link to={loginPath} className="font-semibold text-[#783DF0] underline-offset-4 hover:underline dark:text-[#BFA6FF]">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <Button
          type="button"
          variant="outline"
          disabled={loading || googleLoading}
          onClick={handleGoogle}
          className="h-[54px] w-full rounded-[15px] border-[#E8E3EF] bg-white text-[13px] font-semibold text-[#332B40] shadow-[0_2px_6px_rgba(33,27,53,0.03)] transition hover:border-[#D4C5F5] hover:bg-[#FAF8FF] dark:border-[#393245] dark:bg-[#1C1825] dark:text-[#F2EDF8] dark:hover:bg-[#282233]"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-[18px] w-[18px]" />}
          Sign up with Google
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#ECE8F1] dark:bg-[#393245]" />
          <span className="text-[10px] font-semibold tracking-[0.16em] text-[#A19AAA]">OR WITH EMAIL</span>
          <div className="h-px flex-1 bg-[#ECE8F1] dark:bg-[#393245]" />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-[13px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={labelClass}>Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#A29AAC]" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={labelClass}>Create password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#A29AAC]" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#92899F] transition hover:bg-[#F0ECF6] hover:text-[#51465F] dark:hover:bg-[#302A3A] dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className={labelClass}>Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#A29AAC]" aria-hidden="true" />
              <Input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#92899F] transition hover:bg-[#F0ECF6] hover:text-[#51465F] dark:hover:bg-[#302A3A] dark:hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className={primaryButtonClass} disabled={loading || googleLoading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your account...</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="pt-1 text-center text-[11px] leading-5 text-[#9A93A5] dark:text-[#8E859C]">
          By creating an account, you agree to keep your HOMORA account information accurate and secure.
        </p>
      </div>
    </AuthLayout>
  );
}
