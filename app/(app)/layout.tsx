import { AppShell } from "@/components/layout/AppShell";
import { IncomingCallListener } from "@/components/live/IncomingCallListener";
import { OnboardingGate } from "@/components/providers/OnboardingGate";

/** Wraps all authenticated feature pages in the responsive app shell. */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {/* Signed in but not set up yet → routed back to the unfinished step. */}
      <OnboardingGate>
        {children}
        {/* Calls can arrive on any page, so the ringer lives at the layout level. */}
        <IncomingCallListener />
      </OnboardingGate>
    </AppShell>
  );
}
