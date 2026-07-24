"use client";

/** Owner: Agent (sign-up). Branded custom Clerk sign-up flow — full name, debounced
 *  username availability check against Supabase `profiles`, email, password, optional
 *  referral code, Google OAuth, and the Clerk email-verification code step. */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Gift,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { GlassCard, PrimaryButton } from "@/components/ui";
import { cn, normalizeUsername } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "short";

/** Debounced Supabase lookup — mirrors the mobile SignUpScreen's availability check. */
function useUsernameAvailability(rawUsername: string) {
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const normalized = useMemo(() => normalizeUsername(rawUsername), [rawUsername]);

  useEffect(() => {
    if (!normalized) {
      setStatus("idle");
      return;
    }
    if (normalized.length < 3) {
      setStatus("short");
      return;
    }
    setStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", normalized)
          .maybeSingle();
        if (error) throw error;
        setStatus(data ? "taken" : "available");
      } catch (err) {
        console.error("[sign-up] username check failed:", err);
        // Fail open — don't block the form on a network hiccup.
        setStatus("idle");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [normalized]);

  return { normalized, status };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { normalized: normalizedUsername, status: usernameStatus } =
    useUsernameAvailability(username);

  const usernameError =
    usernameStatus === "taken"
      ? "Username taken"
      : usernameStatus === "short"
        ? "Too short"
        : "";

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: "/onboarding",
      });
    } catch (err) {
      console.error("[sign-up] Google OAuth failed:", err);
      toast.error("Couldn't start Google sign-up. Please try again.");
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    let ok = true;
    if (!fullName.trim()) {
      setFullNameError("Name is required");
      ok = false;
    } else {
      setFullNameError("");
    }

    if (!email) {
      setEmailError("Email is required");
      ok = false;
    } else if (!EMAIL_RE.test(email)) {
      setEmailError("Invalid email format");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      ok = false;
    } else if (password.length < 6) {
      setPasswordError("Min. 6 characters");
      ok = false;
    } else {
      setPasswordError("");
    }

    if (!normalizedUsername || normalizedUsername.length < 3) {
      ok = false;
    }
    if (usernameStatus === "taken" || usernameStatus === "checking") {
      ok = false;
    }

    return ok;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        username: normalizedUsername,
        unsafeMetadata: {
          fullName: fullName.trim(),
          referralCode: referralCode.trim() || undefined,
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
      toast.success("Check your email for a verification code.");
    } catch (err: unknown) {
      console.error("[sign-up] create failed:", err);
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (code.trim().length < 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        toast.success("Welcome to LinguaLink!");
        router.push("/onboarding");
      } else {
        console.warn("[sign-up] verification incomplete:", attempt.status);
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[sign-up] verification failed:", err);
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
        "Invalid or expired code.";
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("New code sent.");
    } catch (err) {
      console.error("[sign-up] resend failed:", err);
      toast.error("Couldn't resend the code.");
    }
  };

  if (step === "verify") {
    return (
      <div className="w-full">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Verify your <span className="text-brand-gradient">email</span>
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-6">
          <FieldGroup label="Verification code">
            <input
              value={code}
              onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-full bg-transparent text-center text-lg tracking-[0.5em] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] placeholder:tracking-normal"
            />
          </FieldGroup>

          <PrimaryButton type="submit" loading={verifying} rightIcon={<ArrowRight className="h-5 w-5" />}>
            {verifying ? "Verifying..." : "Verify & Continue"}
          </PrimaryButton>

          <button
            type="button"
            onClick={handleResend}
            className="text-center text-sm font-medium text-[var(--color-primary)] hover:brightness-110"
          >
            Resend code
          </button>

          <button
            type="button"
            onClick={() => setStep("form")}
            className="text-center text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Back to sign up
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Create <span className="text-brand-gradient">Account</span>
      </h1>
      <p className="mt-2 text-center text-sm text-[var(--muted)]">
        Join the community of language preservers.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <FieldGroup label="Full Name" error={fullNameError}>
          <User className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            value={fullName}
            onChange={(ev) => {
              setFullName(ev.target.value);
              setFullNameError("");
            }}
            placeholder="John Doe"
            autoComplete="name"
            className="w-full bg-transparent text-center text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </FieldGroup>

        <FieldGroup label="Choose Handle" error={usernameError} statusIcon={<UsernameStatusIcon status={usernameStatus} />}>
          <AtSign className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            placeholder="unique_username"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            className="w-full bg-transparent text-center text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </FieldGroup>

        <FieldGroup label="Email Address" error={emailError}>
          <Mail className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            value={email}
            onChange={(ev) => {
              setEmail(ev.target.value);
              setEmailError("");
            }}
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            className="w-full bg-transparent text-center text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </FieldGroup>

        <FieldGroup label="Password" error={passwordError}>
          <Lock className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            value={password}
            onChange={(ev) => {
              setPassword(ev.target.value);
              setPasswordError("");
            }}
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className="w-full bg-transparent text-center text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="shrink-0 text-[var(--color-primary)]"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </FieldGroup>

        <FieldGroup label="Referral Code (Optional)">
          <Gift className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            value={referralCode}
            onChange={(ev) => setReferralCode(ev.target.value)}
            placeholder="e.g. @username"
            autoCapitalize="none"
            className="w-full bg-transparent text-center text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </FieldGroup>

        <PrimaryButton type="submit" loading={submitting} rightIcon={<ArrowRight className="h-5 w-5" />}>
          {submitting ? "Creating..." : "Create Account"}
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border-light)]" />
        <span className="text-xs tracking-widest text-[var(--muted)]">OR</span>
        <div className="h-px flex-1 bg-[var(--border-light)]" />
      </div>

      <GlassCard className="rounded-[28px]" intensity={30}>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={submitting || googleLoading}
          className="flex h-14 w-full items-center justify-center gap-3 font-semibold text-[var(--foreground)] disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          Continue with Google
        </button>
      </GlassCard>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-extrabold text-[var(--color-primary)]">
          Log In
        </Link>
      </p>

      {/* id="clerk-captcha" is required when bot protection is enabled for this instance */}
      <div id="clerk-captcha" />
    </div>
  );
}

function FieldGroup({
  label,
  error,
  statusIcon,
  children,
}: {
  label: string;
  error?: string;
  statusIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-center gap-2 px-1">
        <span className="text-[13px] font-semibold text-[var(--muted)]">{label}</span>
        {error ? <span className="text-[10px] text-[var(--error)]">{error}</span> : null}
      </div>
      <GlassCard
        className={cn("h-16 rounded-[20px]", error && "border-[var(--error)]")}
        intensity={30}
      >
        <div className="flex h-full w-full items-center gap-4 px-4">
          {children}
          {statusIcon}
        </div>
      </GlassCard>
    </div>
  );
}

function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  if (status === "checking") {
    return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--muted)]" />;
  }
  if (status === "available") {
    return <Check className="h-5 w-5 shrink-0 text-[var(--success)]" />;
  }
  if (status === "taken") {
    return <X className="h-5 w-5 shrink-0 text-[var(--error)]" />;
  }
  return null;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.33A7.2 7.2 0 0 1 4.9 12c0-.81.14-1.6.38-2.33V6.58H1.3A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.3 5.42l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.58l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"
      />
    </svg>
  );
}
