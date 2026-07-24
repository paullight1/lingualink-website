"use client";

// Route-group error boundary for the authenticated (app) shell — catches render/data errors
// in any nested page and offers a way to recover without a full reload.
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { EmptyState, PrimaryButton } from "@/components/ui";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] w-full items-center justify-center px-4">
      <EmptyState
        icon={<AlertTriangle className="h-7 w-7" />}
        title="Something went wrong"
        message="We hit a snag loading this page. Please try again."
        action={
          <PrimaryButton size="md" fullWidth={false} onClick={() => reset()}>
            Try again
          </PrimaryButton>
        }
      />
    </div>
  );
}
