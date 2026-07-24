import { cn } from "@/lib/utils";

/** Consistent page padding + max width for feature pages inside the AppShell. */
export function PageContainer({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const max = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" }[size];
  return (
    <div className={cn("mx-auto w-full px-4 py-4 sm:px-6", max, className)}>
      {children}
    </div>
  );
}
