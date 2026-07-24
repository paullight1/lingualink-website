import { AppShell } from "@/components/layout/AppShell";

/** Wraps all authenticated feature pages in the responsive app shell. */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
