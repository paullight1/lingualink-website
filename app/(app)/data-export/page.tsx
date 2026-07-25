"use client";

/** Download your LinguaLink data (GDPR portability). */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileJson, ShieldCheck, Star } from "lucide-react";
import toast from "react-hot-toast";

import { AppHeader, GlassCard, Spinner } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import {
  exportReputationHistory,
  exportUserData,
  exportValidationHistory,
} from "@/lib/api/dataExport";

const OPTIONS = [
  {
    id: "all",
    title: "All my data",
    description: "Profile, clips, validations and reputation in one file",
    icon: FileJson,
    color: "#FF8A00",
    run: exportUserData,
  },
  {
    id: "validations",
    title: "Validation history",
    description: "Every clip you've reviewed and how you graded it",
    icon: ShieldCheck,
    color: "#10B981",
    run: exportValidationHistory,
  },
  {
    id: "reputation",
    title: "Reputation history",
    description: "How your trust score has changed over time",
    icon: Star,
    color: "#8B5CF6",
    run: exportReputationHistory,
  },
];

export default function DataExportPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const [running, setRunning] = useState<string | null>(null);

  const handleExport = async (
    id: string,
    run: (userId: string) => Promise<void>
  ) => {
    if (!userId) {
      toast.error("You must be signed in to export data");
      return;
    }
    if (running) return;

    setRunning(id);
    try {
      await run(userId);
      toast.success("Export downloaded");
    } catch (err) {
      console.error("[dataExport] failed", err);
      toast.error("Couldn't export that data");
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader title="Export Data" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <p className="mb-5 text-sm text-[var(--muted)]">
          Export your LinguaLink data for backup or analysis. All exports comply
          with GDPR data portability requirements.
        </p>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isRunning = running === option.id;
            return (
              <GlassCard key={option.id} className="p-0">
                <button
                  type="button"
                  onClick={() => handleExport(option.id, option.run)}
                  disabled={!!running}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:brightness-110 disabled:opacity-60"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${option.color}1A`,
                      color: option.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--foreground)]">
                      {option.title}
                    </span>
                    <span className="block text-sm text-[var(--muted)]">
                      {option.description}
                    </span>
                  </span>
                  {isRunning ? (
                    <Spinner className="h-5 w-5 shrink-0" />
                  ) : (
                    <Download className="h-5 w-5 shrink-0 text-[var(--muted)]" />
                  )}
                </button>
              </GlassCard>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
