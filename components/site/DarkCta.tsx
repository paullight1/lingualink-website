import { Reveal } from "./Reveal";

const appUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:3000";

/* The one deliberate dark band on each page: final download call to action. */
export function DarkCta() {
  return (
    <section id="get" className="bg-night">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <h2 className="max-w-[16ch] text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl">
              Put your language on the record.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-night-soft">
              Create your account, pick your language, and record your first
              phrase today.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 md:justify-self-end">
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`${appUrl}/sign-up`}
                className="rounded-full bg-brand px-6 py-3.5 text-[16px] font-bold text-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
              >
                Create your account
              </a>
              <a
                href={`${appUrl}/sign-in`}
                className="text-[16px] font-semibold text-white underline decoration-brand underline-offset-4"
              >
                Log in
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
