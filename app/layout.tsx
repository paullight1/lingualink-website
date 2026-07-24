import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lingualink.app"),
  title: {
    default: "LinguaLink | Speak your language. Get paid for it.",
    template: "%s | LinguaLink",
  },
  description:
    "LinguaLink pays you to record short phrases in Yoruba, Igbo, Hausa and more. Every clip helps keep African languages alive.",
  openGraph: {
    title: "LinguaLink",
    description:
      "Record short phrases in your language. Earn real money. Keep your language alive.",
    images: ["/images/hero.jpg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
