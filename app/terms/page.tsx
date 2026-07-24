import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using LinguaLink, in plain language.",
};

export default function TermsPage() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 md:px-8 md:pt-24">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-[14px] text-ink-soft">Last updated: 1 July 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-relaxed text-ink-soft [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink">
          <div>
            <h2>The deal</h2>
            <p className="mt-3">
              LinguaLink pays you for recording and checking short phrases in
              your language. In return, you give us permission to include your
              approved recordings in validated speech collections used to
              research and build language technology. You must be at least 13
              years old to use the app, and old enough to receive payments
              under your local law to withdraw money.
            </p>
          </div>

          <div>
            <h2>Your recordings</h2>
            <p className="mt-3">
              Record only your own voice, and only phrases you are shown or
              content you have the right to share. Do not record other people
              without their permission. You keep ownership of your voice; you
              grant us a license to use approved clips as described in the
              privacy policy.
            </p>
          </div>

          <div>
            <h2>Earning fairly</h2>
            <p className="mt-3">
              Points are earned for honest work: real recordings, careful
              validation. Fake clips, bots, duplicate accounts or dishonest
              validation break the system for everyone and lead to account
              suspension and loss of unpaid balance.
            </p>
          </div>

          <div>
            <h2>Community rules</h2>
            <p className="mt-3">
              Be respectful in comments, stories and messages. No harassment,
              hate speech, or harmful content. We remove content that breaks
              these rules and may suspend repeat offenders.
            </p>
          </div>

          <div>
            <h2>Payments</h2>
            <p className="mt-3">
              Withdrawals go to the bank account or mobile wallet you provide.
              Amounts, minimums and timing are shown in the app before you
              confirm. We may hold or reverse payments linked to fraud.
            </p>
          </div>

          <div>
            <h2>Changes and contact</h2>
            <p className="mt-3">
              If these terms change in a way that matters, we tell you in the
              app before the change takes effect. Questions:{" "}
              <a href="mailto:hello@lingualink.app" className="font-semibold text-brand-text underline underline-offset-2">
                hello@lingualink.app
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
