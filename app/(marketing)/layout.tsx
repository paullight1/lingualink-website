import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="marketing-site min-h-dvh bg-bg text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-gray-900 focus:shadow-lg">
        Skip to content
      </a>
      <Nav />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
