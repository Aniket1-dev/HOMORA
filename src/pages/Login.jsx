import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { signInWithPassword, signInWithGoogle } from "@/lib/auth";
import MfaChallenge from "@/components/MfaChallenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

const inputClass =
  "h-[53px] rounded-[13px] border-[#E5DFEE] bg-[#FBFAFD] pl-11 pr-11 text-[14px] text-[#211B35] shadow-none transition placeholder:text-[#81778F] focus-visible:border-[#783DF0] focus-visible:ring-2 focus-visible:ring-[#783DF0]/15";
const labelClass = "text-[12px] font-semibold text-[#302A3B]";
const primaryButtonClass =
  "h-[54px] w-full rounded-[13px] bg-gradient-to-r from-[#854CF4] to-[#7134E8] text-[14px] font-semibold text-white shadow-[0_12px_24px_-14px_rgba(120,61,240,0.8)] transition hover:-translate-y-0.5 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-[#783DF0]/30 focus-visible:ring-offset-2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const returnTo = safeReturnTo();

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  if (mfaChallenge) return <MfaChallenge factorId={mfaChallenge.factorId} returnTo={returnTo} />;

  return (
    <AuthLayout
      icon={HomeIcon}
      title="Welcome back"
      subtitle="Log in to your HOMORA Discover account."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-semibold text-[#783DF0] underline-offset-4 hover:underline"
          >
            Create one
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
          className="h-[53px] w-full rounded-[13px] border-[#E5DFEE] bg-white text-[13px] font-semibold text-[#211B35] shadow-[0_3px_10px_rgba(42,25,72,0.035)] transition hover:border-[#D5C6F5] hover:bg-[#FBF9FF]"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-[19px] w-[19px]" />}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E8E3ED]" />
          <span className="text-[10px] font-semibold tracking-[0.14em] text-[#7B7288]">OR SIGN IN WITH EMAIL</span>
          <div className="h-px flex-1 bg-[#E8E3ED]" />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={labelClass}>Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#82788F]" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className={labelClass}>Password</Label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-[#783DF0] underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#82788F]" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#766D83] transition hover:bg-[#F0ECF6] hover:text-[#51465F]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className={primaryButtonClass} disabled={loading || googleLoading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Log in <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

function HomeIcon(props) {
  const { Home } = require("lucide-react");
  return <Home {...props} />;
}
