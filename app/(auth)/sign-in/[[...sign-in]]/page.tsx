"use client";

/** Branded custom sign-in: email/password + Google OAuth via useSignIn(),
 *  self-contained forgot-password flow, ported from mobile SignInScreen/ModernAuthLanding. */

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn, AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Mail, Lock, LogIn, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  Field,
  GlassCard,
  Input,
  PasswordInput,
  PrimaryButton,
  Spinner,
} from "@/components/ui";
import { AppleGlyph, GoogleGlyph } from "../../OAuthGlyphs";

/** Pull a human-readable message out of a Clerk API error. */
function clerkErrorMessage(err: unknown, fallback: string): string {
  const errors = (err as { errors?: { longMessage?: string; message?: string }[] })?.errors;
  return errors?.[0]?.longMessage || errors?.[0]?.message || fallback;
}

type View = "sign-in" | "forgot-request" | "forgot-reset";

export default function SignInPage() {
  const pathname = usePathname();

  // Google OAuth redirects back through this same catch-all route at
  // /sign-in/sso-callback — finish the handshake instead of showing the form.
  if (pathname?.includes("sso-callback")) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Spinner />
        <p className="text-sm text-[var(--muted)]">Finishing sign in…</p>
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/feed"
          // "Continue with Google" on the sign-in page is also how a brand-new
          // user arrives — Clerk transfers the attempt to a sign-up. They must
          // start at onboarding, not at a feed with no profile row behind it.
          signUpForceRedirectUrl="/onboarding"
        />
      </div>
    );
  }

  return <SignInFlow />;
}

function SignInFlow() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [view, setView] = useState<View>("sign-in");

  // sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthPending, setOauthPending] = useState<
    "oauth_google" | "oauth_apple" | null
  >(null);

  // forgot-password fields
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const disabled = loading || oauthPending !== null;

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
        strategy: "password",
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed");
      } else {
        toast.error("Additional verification is required to sign in.");
      }
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Sign in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  /** Both providers the Clerk instance enables (oauth_google, oauth_apple). */
  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) return;
    setOauthPending(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/feed",
      });
    } catch (err) {
      setOauthPending(null);
      const label = strategy === "oauth_apple" ? "Apple" : "Google";
      toast.error(
        clerkErrorMessage(err, `${label} sign in failed. Please try again.`)
      );
    }
  };

  const handleSendResetCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      await signIn.create({
        identifier: resetEmail,
        strategy: "reset_password_email_code",
      });
      toast.success("Check your inbox for a reset code.");
      setView("forgot-reset");
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Couldn't send a reset code. Please try again."));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!resetCode || !newPassword) {
      toast.error("Please enter the code and a new password");
      return;
    }

    setResetLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password updated. Welcome back!");
        router.push("/feed");
      } else {
        toast.error("That code didn't work. Please try again.");
      }
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Couldn't reset your password. Please try again."));
    } finally {
      setResetLoading(false);
    }
  };

  if (view !== "sign-in") {
    return (
      <ForgotPasswordFlow
        view={view}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        resetCode={resetCode}
        setResetCode={setResetCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        resetLoading={resetLoading}
        onSendCode={handleSendResetCode}
        onResetPassword={handleResetPassword}
        onBack={() => setView("sign-in")}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
        Welcome <span className="text-[var(--color-primary)]">Back</span>
      </h1>
      <p className="mt-2 text-center text-[var(--muted)]">
        Continue your legacy of language preservation.
      </p>

      <form onSubmit={handleSignIn} className="mt-10 flex w-full flex-col gap-5">
        <Field label="Email address" htmlFor="sign-in-email">
          <Input
            id="sign-in-email"
            variant="glass"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <Field label="Password" htmlFor="sign-in-password">
            <PasswordInput
              id="sign-in-password"
              variant="glass"
              icon={Lock}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setView("forgot-request")}
              className="text-[13px] font-semibold text-[var(--color-primary)] hover:brightness-110"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <PrimaryButton
          className="mt-1"
          type="submit"
          size="lg"
          loading={loading}
          disabled={disabled}
          rightIcon={!loading ? <LogIn className="h-5 w-5" /> : undefined}
        >
          {loading ? "Logging In..." : "Sign In"}
        </PrimaryButton>
      </form>

      <div className="mt-8 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border-light)]" />
        <span className="text-[11px] tracking-[2px] text-[var(--muted)]">OR</span>
        <div className="h-px flex-1 bg-[var(--border-light)]" />
      </div>

      <div className="mt-6 flex w-full flex-col gap-3">
        <GlassCard className="h-14 w-full rounded-[28px]" intensity={30}>
          <button
            type="button"
            onClick={() => handleOAuth("oauth_google")}
            disabled={disabled}
            className="flex h-full w-full items-center justify-center gap-3 disabled:opacity-60"
          >
            <GoogleGlyph className="h-[22px] w-[22px]" />
            <span className="text-[15px] font-bold text-[var(--foreground)]">
              {oauthPending === "oauth_google"
                ? "Connecting…"
                : "Continue with Google"}
            </span>
          </button>
        </GlassCard>

        <GlassCard className="h-14 w-full rounded-[28px]" intensity={30}>
          <button
            type="button"
            onClick={() => handleOAuth("oauth_apple")}
            disabled={disabled}
            className="flex h-full w-full items-center justify-center gap-3 disabled:opacity-60"
          >
            <AppleGlyph className="h-[22px] w-[22px]" />
            <span className="text-[15px] font-bold text-[var(--foreground)]">
              {oauthPending === "oauth_apple"
                ? "Connecting…"
                : "Continue with Apple"}
            </span>
          </button>
        </GlassCard>
      </div>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-extrabold text-[var(--color-primary)]">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

interface ForgotPasswordFlowProps {
  view: Extract<View, "forgot-request" | "forgot-reset">;
  resetEmail: string;
  setResetEmail: (v: string) => void;
  resetCode: string;
  setResetCode: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  resetLoading: boolean;
  onSendCode: (e: FormEvent) => void;
  onResetPassword: (e: FormEvent) => void;
  onBack: () => void;
}

/** Inline forgot-password mini-flow: request a code, then submit code + new password. */
function ForgotPasswordFlow({
  view,
  resetEmail,
  setResetEmail,
  resetCode,
  setResetCode,
  newPassword,
  setNewPassword,
  resetLoading,
  onSendCode,
  onResetPassword,
  onBack,
}: ForgotPasswordFlowProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex h-11 w-11 items-center justify-center self-start rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--foreground)]"
        aria-label="Back to sign in"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <h1 className="text-center text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {view === "forgot-request" ? "Reset your password" : "Check your email"}
      </h1>
      <p className="mt-2 text-center text-[var(--muted)]">
        {view === "forgot-request"
          ? "Enter the email tied to your account and we'll send you a reset code."
          : `Enter the code we sent to ${resetEmail || "your email"}, plus a new password.`}
      </p>

      {view === "forgot-request" ? (
        <form onSubmit={onSendCode} className="mt-10 flex w-full flex-col gap-6">
          <Field label="Email address" htmlFor="reset-email">
            <Input
              id="reset-email"
              variant="glass"
              icon={Mail}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              placeholder="name@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </Field>

          <PrimaryButton type="submit" size="lg" loading={resetLoading}>
            {resetLoading ? "Sending…" : "Send Reset Code"}
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="mt-10 flex w-full flex-col gap-5">
          <Field label="Reset code" htmlFor="reset-code">
            <Input
              id="reset-code"
              variant="glass"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="123456"
              align="center"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-[22px] font-bold tracking-[0.4em] placeholder:font-normal placeholder:tracking-[0.2em]"
            />
          </Field>

          <Field label="New password" htmlFor="new-password">
            <PasswordInput
              id="new-password"
              variant="glass"
              icon={Lock}
              autoComplete="new-password"
              placeholder="Choose a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>

          <PrimaryButton className="mt-1" type="submit" size="lg" loading={resetLoading}>
            {resetLoading ? "Updating…" : "Reset Password"}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
