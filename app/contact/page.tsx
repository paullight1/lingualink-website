import type { Metadata } from "next";
import { ChatTeardropText, Handshake, Question } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Write to the LinguaLink team. A real person answers, usually within two working days.",
};

const channels = [
  {
    icon: Question,
    title: "Help with the app",
    text: "Stuck on a withdrawal, a rejected clip, or a login problem? Tell us what happened and include your username.",
    email: "support@lingualink.app",
  },
  {
    icon: ChatTeardropText,
    title: "Say hello",
    text: "Feedback, ideas, or a language you want us to add next. We read everything.",
    email: "hello@lingualink.app",
  },
  {
    icon: Handshake,
    title: "Partnerships and press",
    text: "Researchers, NGOs, media and language organizations. Tell us what you are working on.",
    email: "partners@lingualink.app",
  },
];

export default function ContactPage() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 md:px-8 md:pt-24">
        <Reveal>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Talk to us.
          </h1>
          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            A real person answers every message, usually within two working
            days.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {channels.map((channel, i) => (
            <Reveal key={channel.email} delay={i * 0.08}>
              <a
                href={`mailto:${channel.email}`}
                className="group flex h-full flex-col rounded-card border border-line bg-white p-7 transition-colors hover:border-brand"
              >
                <channel.icon
                  size={30}
                  weight="duotone"
                  aria-hidden="true"
                  className="text-brand-deep"
                />
                <h2 className="mt-5 text-xl font-bold tracking-tight">
                  {channel.title}
                </h2>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft">
                  {channel.text}
                </p>
                <p className="mt-5 font-semibold text-brand-text underline-offset-4 group-hover:underline">
                  {channel.email}
                </p>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
            Prefer social media? Find us as <strong>@lingualinkapp</strong> on
            the usual platforms. For anything about your personal data, email{" "}
            <a
              href="mailto:privacy@lingualink.app"
              className="font-semibold text-brand-text underline underline-offset-2"
            >
              privacy@lingualink.app
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
