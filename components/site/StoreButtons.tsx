import { AppStoreLogo, GooglePlayLogo } from "@phosphor-icons/react/dist/ssr";

/*
  App download buttons for the dark CTA band. Both stores point at the app's
  listing pages; swap the hrefs when the store URLs are live.
*/
export function StoreButtons() {
  const base =
    "inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-left transition-transform hover:-translate-y-px active:scale-[0.98]";
  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href="https://play.google.com/store/search?q=lingualink"
        className={`${base} bg-gradient-to-br from-brand to-brand-deep text-ink`}
      >
        <GooglePlayLogo size={26} weight="fill" aria-hidden="true" />
        <span>
          <span className="block text-[11px] font-medium leading-none opacity-80">
            Get it on
          </span>
          <span className="block text-[16px] font-bold leading-tight">
            Google Play
          </span>
        </span>
      </a>
      <a
        href="https://www.apple.com/app-store/"
        className={`${base} border border-night-line bg-transparent text-white hover:border-brand`}
      >
        <AppStoreLogo size={26} weight="fill" aria-hidden="true" />
        <span>
          <span className="block text-[11px] font-medium leading-none opacity-80">
            Download on the
          </span>
          <span className="block text-[16px] font-bold leading-tight">
            App Store
          </span>
        </span>
      </a>
    </div>
  );
}
