import { Reveal } from "./Reveal";
import { StoreButtons } from "./StoreButtons";

/* The one deliberate dark band on each page: final download call to action. */
export function DarkCta() {
  return (
    <section id="get" className="bg-night">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <h2 className="max-w-[16ch] text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl">
              Your voice can keep a language alive.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-night-soft">
              Download LinguaLink, pick your language, and record your first
              phrase today. It is free.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 md:justify-self-end">
            <StoreButtons />
            <p className="mt-4 text-[13px] text-night-soft">
              Works on low-cost phones. Light on data.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
