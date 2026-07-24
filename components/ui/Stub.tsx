import { Construction } from "lucide-react";
import { EmptyState } from "./EmptyState";

/**
 * Placeholder for a route being implemented by a feature agent in Phase 1.
 * Replace the whole page when building the real feature.
 */
export function Stub({ name }: { name: string }) {
  return (
    <EmptyState
      icon={<Construction className="h-7 w-7" />}
      title={name}
      message="This screen is being built."
    />
  );
}
