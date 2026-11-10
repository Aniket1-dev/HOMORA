import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";
import { signInWithPassword, signInWithGoogle } from "@/lib/auth";
import MfaChallenge from "@/components/MfaChallenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

const inputClass =
  "h-[54px] rounded-[13px] border-[#E7E2EB] bg-white pl-11 pr-12 text-[14px] text-[#211B35] shadow-none transition placeholder:text-[#AAA3B4] focus-visible:border-[#783DF0] focus-visible:ring-2 focus-visible:ring-[#783DF0]/15 dark:border-[#393245] dark:bg-[#1C1825] dark:text-[#F5F1FA] dark:placeholder:text-[#827A90]";
const labelClass = "text-[12px] font-semibold text-[#41394F] dark:text-[#DAD4E5]";
const primaryButtonClass =
  "h-[54px] w-full rounded-[13px] bg-[#783DF0] text-[14px] font-semibold text-white shadow-[0_8px_18px_-12px_rgba(120,61,240,0.75)] transition hover:bg-[#6C32E4] focus-visible:ring-2 focus-visible:ring-[#783DF0]/30 focus-visible:ring-offset-2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPassword(email.trim(), password);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "We couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle(returnTo);
    } catch (err) {
      setError(err.message || "Unable to sign in with Google.");
      setGoogleLoading(false);
    }
  };

  if (mfaChallenge) {
    return <MfaChallenge factorId={mfaChallenge.factorId} returnTo={returnTo} />;
  }

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to continue your search and pick up where you left off."
      footer={
        <>
          New to HOMORA?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-semibold text-[#783DF0] underline-offset-4 hover:underline dark:text-[#BFA6FF]"
          >
            Create an account
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
          className="h-[54px] w-full rounded-[13px] border-[#E7E2EB] bg-white text-[13px] font-semibold text-[#332B40] shadow-none transition hover:border-[#D4C5F5] hover:bg-[#FAF8FF] dark:border-[#393245] dark:bg-[#1C1825] dark:text-[#F2EDF8] dark:hover:bg-[#282233]"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-[18px] w-[18px]" />}
          Continue with Google
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#ECE8F1] dark:bg-[#393245]" />
          <span className="text-[10px] font-semibold tracking-[0.14em] text-[#A19AAA]">OR</span>
          <div className="h-px flex-1 bg-[#ECE8F1] dark:bg-[#393245]" />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className={labelClass}>Password</Label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-[#783DF0] underline-offset-4 hover:underline dark:text-[#BFA6FF]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#A29AAC]" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
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

          <Button type="submit" className={primaryButtonClass} disabled={loading || googleLoading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing you in...</> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="pt-1 text-center text-[11px] leading-5 text-[#9A93A5] dark:text-[#8E859C]">
          Your information stays private and secure.
        </p>
      </div>
    </AuthLayout>
  );
}
