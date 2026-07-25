import { AppShell } from "@/components/layout/AppShell";
import { IncomingCallListener } from "@/components/live/IncomingCallListener";

/** Wraps all authenticated feature pages in the responsive app shell. */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      {/* Calls can arrive on any page, so the ringer lives at the layout level. */}
      <IncomingCallListener />
    </AppShell>
  );
}
