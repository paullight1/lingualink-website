import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="marketing-site min-h-dvh bg-bg text-ink">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
