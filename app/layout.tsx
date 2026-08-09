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
    default: "LinguaLink | Put your language on the record.",
    template: "%s | LinguaLink",
  },
  description:
    "LinguaLink turns everyday speech in African languages into useful voice data and puts value back in the hands of the people who speak it.",
  openGraph: {
    title: "LinguaLink",
    description:
      "Record everyday speech in African languages, contribute to better voice technology, and earn for your contribution.",
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
