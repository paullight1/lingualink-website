import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How LinguaLink collects, uses and protects your information, in plain language.",
};

export default function PrivacyPage() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 md:px-8 md:pt-24">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[14px] text-ink-soft">Last updated: 1 July 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-relaxed text-ink-soft [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink">
          <p>
            We wrote this policy in plain language on purpose. If anything is
            unclear, email{" "}
            <a href="mailto:privacy@lingualink.app" className="font-semibold text-brand-text underline underline-offset-2">
              privacy@lingualink.app
            </a>{" "}
            and we will explain it.
          </p>

          <div>
            <h2>What we collect</h2>
            <p className="mt-3">
              When you use LinguaLink we collect: your account details (name,
              username, email), your voice, video and story recordings, the
              language, dialect and region tags you choose, and basic usage
              information that helps the app work well on your phone. Location
              and age range are optional and only collected if you agree.
            </p>
          </div>

          <div>
            <h2>How we use it</h2>
            <p className="mt-3">
              Recordings that pass validation join a speech collection for your
              language. This collection is used to research and build
              technology that understands African languages. Your account
              details are used to run the app, pay you, and keep the community
              safe. We separate recordings from your name and contact details
              before they are shared with any partner.
            </p>
          </div>

          <div>
            <h2>What we never do</h2>
            <p className="mt-3">
              We do not sell your personal information. We do not allow anyone
              to use your recordings to imitate or clone your voice. We do not
              change how your data is used without telling you in the app
              first.
            </p>
          </div>

          <div>
            <h2>Payments</h2>
            <p className="mt-3">
              To pay you, we process your withdrawal details, such as your bank
              account or mobile wallet number. Payment partners see only what
              they need to move the money.
            </p>
          </div>

          <div>
            <h2>Your choices</h2>
            <p className="mt-3">
              You can edit your profile, turn optional data off, or ask for
              your account to be deleted at any time, inside the app or by
              email. When you delete your account we remove your profile and
              personal details, and we explain clearly what happens to clips
              that were already validated.
            </p>
          </div>

          <div>
            <h2>Security</h2>
            <p className="mt-3">
              Your data is stored with trusted cloud providers, protected in
              transit and at rest, and access inside our team is limited to
              people who need it to do their jobs.
            </p>
          </div>

          <div>
            <h2>Contact</h2>
            <p className="mt-3">
              Questions or requests about your data:{" "}
              <a href="mailto:privacy@lingualink.app" className="font-semibold text-brand-text underline underline-offset-2">
                privacy@lingualink.app
              </a>
              . A real person answers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
