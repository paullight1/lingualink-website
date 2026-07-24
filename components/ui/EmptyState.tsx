import { cn } from "@/lib/utils";

/** Centered empty/placeholder state with an icon, title, message, optional CTA. */
export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--input)] text-[var(--muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {message && (
        <p className="max-w-xs text-sm text-[var(--muted)]">{message}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
