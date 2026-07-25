"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Video, Wallet, ListChecks, BookImage, Radio, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom-sheet "Create" menu opened by the center FAB. Mirrors the mobile
 * create options.
 */
interface Action {
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}

const ACTIONS: Action[] = [
  { label: "Record Audio", desc: "Share your voice", icon: Mic, color: "#FF8A00", href: "/record?mode=voice" },
  { label: "Record Video", desc: "Tell a story on camera", icon: Video, color: "#8B5CF6", href: "/record?mode=video" },
  { label: "Add a Story", desc: "Disappears in 24 hours", icon: BookImage, color: "#EC4899", href: "/story/new" },
  { label: "Go Live", desc: "Stream to your followers", icon: Radio, color: "#EF4444", href: "/live/new" },
  { label: "Do a Task", desc: "Earn from microtasks", icon: ListChecks, color: "#3B82F6", href: "/tasks" },
  { label: "View Rewards", desc: "Check your wallet", icon: Wallet, color: "#10B981", href: "/rewards" },
];

export function CreateSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[24px] border border-[var(--border-light)] bg-[var(--surface)] p-5 pb-8 sm:bottom-4 sm:rounded-[24px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Create</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-2">
              {ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={() => go(a.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-[16px] border border-[var(--border-light)] p-3 text-left transition hover:bg-[var(--input)]"
                    )}
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${a.color}1A`, color: a.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{a.label}</span>
                      <span className="block text-sm text-[var(--muted)]">
                        {a.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
