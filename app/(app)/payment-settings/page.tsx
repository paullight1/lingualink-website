"use client";

/** Link the bank account payouts are sent to. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  Field,
  GlassCard,
  Input,
  PrimaryButton,
  SearchInput,
  Skeleton,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { monetizationApi } from "@/lib/api/monetization";
import { cn } from "@/lib/utils";
import type { BankItem } from "@/lib/types";

export default function PaymentSettingsPage() {
  const router = useRouter();

  const [bankQuery, setBankQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankItem | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [linking, setLinking] = useState(false);

  // Manual entry covers banks the provider can't resolve automatically.
  const [manualMode, setManualMode] = useState(false);
  const [manualBankName, setManualBankName] = useState("");
  const [manualAccountName, setManualAccountName] = useState("");

  const banksQuery = useQuery({
    queryKey: ["bank-list"],
    queryFn: () => monetizationApi.getBankList(),
    staleTime: 60 * 60_000,
  });

  const linkedQuery = useQuery({
    queryKey: ["linked-bank"],
    queryFn: () => monetizationApi.getLinkedBank(),
  });

  const banks = banksQuery.data ?? [];

  const filteredBanks = useMemo(() => {
    const term = bankQuery.trim().toLowerCase();
    if (!term) return banks.slice(0, 30);
    return banks.filter((b) => b.name.toLowerCase().includes(term)).slice(0, 30);
  }, [banks, bankQuery]);

  // Account names resolve automatically once a bank and a 10-digit number are set.
  useEffect(() => {
    if (manualMode || !selectedBank || accountNumber.length !== 10) {
      setResolvedName(null);
      return;
    }
    let cancelled = false;
    setResolving(true);
    monetizationApi
      .resolveBank(accountNumber, selectedBank.code)
      .then((result) => {
        if (!cancelled) setResolvedName(result.accountName);
      })
      .catch(() => {
        if (!cancelled) setResolvedName(null);
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBank, accountNumber, manualMode]);

  const handleLink = async () => {
    if (linking) return;
    if (!accountNumber.trim()) {
      toast.error("Enter your account number");
      return;
    }
    if (!manualMode && !selectedBank) {
      toast.error("Pick your bank");
      return;
    }
    if (manualMode && (!manualBankName.trim() || !manualAccountName.trim())) {
      toast.error("Enter your bank and account name");
      return;
    }

    setLinking(true);
    try {
      await monetizationApi.linkBank(
        accountNumber.trim(),
        selectedBank?.code ?? "",
        manualMode
          ? {
              bankName: manualBankName.trim(),
              accountName: manualAccountName.trim(),
            }
          : undefined
      );
      toast.success("Bank account linked");
      await linkedQuery.refetch();
      setAccountNumber("");
      setResolvedName(null);
    } catch (err) {
      console.error("[payments] link failed", err);
      toast.error(
        err instanceof Error ? err.message : "Couldn't link that account"
      );
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm("Remove this bank account?")) return;
    try {
      await monetizationApi.unlinkBank();
      toast.success("Bank account removed");
      await linkedQuery.refetch();
    } catch {
      toast.error("Couldn't remove that account");
    }
  };

  const linked = linkedQuery.data;

  return (
    <div className="min-h-full">
      <AppHeader title="Payment Settings" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        {/* Currently linked */}
        {linkedQuery.isLoading ? (
          <Skeleton className="mb-5 h-32 w-full rounded-[16px]" />
        ) : linked?.accountNumberLast4 ? (
          <GlassCard className="mb-5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              <h2 className="font-bold text-[var(--foreground)]">
                Linked account
              </h2>
            </div>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Bank</dt>
                <dd className="font-medium text-[var(--foreground)]">
                  {linked.bankName ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Account name</dt>
                <dd className="font-medium text-[var(--foreground)]">
                  {linked.accountName ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Account number</dt>
                <dd className="font-medium tabular-nums text-[var(--foreground)]">
                  ••••{linked.accountNumberLast4}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={handleUnlink}
              className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--error)]"
            >
              <Trash2 className="h-4 w-4" />
              Remove account
            </button>
          </GlassCard>
        ) : null}

        <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          {linked?.accountNumberLast4 ? "Link a different account" : "Link your account"}
        </h2>

        {banksQuery.isError && !manualMode && (
          <p className="mb-3 rounded-2xl bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
            Couldn&apos;t load the bank list. You can enter your details manually
            instead.
          </p>
        )}

        {!manualMode && (
          <>
            <SearchInput
              label="Search banks"
              placeholder="Search for your bank"
              value={bankQuery}
              onChange={(e) => setBankQuery(e.target.value)}
              onClear={() => setBankQuery("")}
              wrapperClassName="mb-3"
            />

            {banksQuery.isLoading ? (
              <Skeleton className="mb-4 h-40 w-full rounded-[16px]" />
            ) : (
              <div className="mb-4 max-h-56 overflow-y-auto rounded-[16px] border border-[var(--border-light)]">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition",
                      selectedBank?.code === bank.code
                        ? "bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary)]"
                        : "text-[var(--foreground)] hover:bg-[var(--input)]"
                    )}
                  >
                    <Building2 className="h-4 w-4 shrink-0 opacity-60" />
                    {bank.name}
                  </button>
                ))}
                {filteredBanks.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                    No banks match that search.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {manualMode && (
          <div className="mb-3 flex flex-col gap-3">
            <Field label="Bank name">
              <Input
                icon={Building2}
                value={manualBankName}
                onChange={(e) => setManualBankName(e.target.value)}
                placeholder="First Bank of Nigeria"
              />
            </Field>
            <Field label="Account name">
              <Input
                value={manualAccountName}
                onChange={(e) => setManualAccountName(e.target.value)}
                placeholder="Name exactly as it appears on the account"
              />
            </Field>
          </div>
        )}

        <Field label="Account number" className="mb-2">
          <Input
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder="0123456789"
            className="tabular-nums tracking-[0.08em]"
          />
        </Field>

        {!manualMode && (resolving || resolvedName) && (
          <p
            className={cn(
              "mb-2 px-1 text-sm",
              resolvedName ? "font-semibold text-[var(--success)]" : "text-[var(--muted)]"
            )}
          >
            {resolving ? "Checking account…" : resolvedName}
          </p>
        )}

        <button
          type="button"
          onClick={() => setManualMode((v) => !v)}
          className="mb-5 px-1 text-sm font-semibold text-[var(--color-primary)]"
        >
          {manualMode ? "Pick from the bank list instead" : "Enter details manually"}
        </button>

        <PrimaryButton loading={linking} disabled={linking} onClick={handleLink}>
          Link Account
        </PrimaryButton>
      </PageContainer>
    </div>
  );
}
