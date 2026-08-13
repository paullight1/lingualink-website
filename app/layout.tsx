import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/lib/query/provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { SupabaseTokenBridge } from "@/components/providers/SupabaseTokenBridge";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lingualink.com"),
  title: "LinguaLink — Preserving languages, one voice at a time",
  description:
    "Record, share, and validate voices in underrepresented languages. Earn as you preserve culture.",
};

export const viewport: Viewport = {
  themeColor: "#1A0800",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Avoid theme flash: set the .dark class before hydration based on stored pref.
const themeInitScript = `(function(){try{var m=localStorage.getItem('lingualink-theme')||'dark';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={bricolage.variable} suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body>
          <ThemeProvider>
            <PostHogProvider>
              <QueryProvider>
                <SupabaseTokenBridge>{children}</SupabaseTokenBridge>
              </QueryProvider>
            </PostHogProvider>
          </ThemeProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1px solid var(--border-light)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
