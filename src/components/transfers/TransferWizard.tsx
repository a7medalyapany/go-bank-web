"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Search,
  AlertCircle,
  User,
  ArrowLeftRight,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTransferAction } from "@/lib/actions/transfers";
import {
  DASHBOARD_CURRENCY_CONFIG,
  formatDashboardBalance,
} from "@/lib/dashboard/view-models";
import type { GoAccount, GoAccountLookup } from "@/lib/api/types";

// ─── Types
interface TransferWizardProps {
  accounts: GoAccount[];
  currentUsername: string;
}

type WizardStep = "source" | "recipient" | "amount" | "confirm" | "success";

interface LookupState {
  status:
    | "idle"
    | "loading"
    | "found"
    | "not_found"
    | "same_user"
    | "currency_mismatch"
    | "error";
  account: GoAccountLookup | null;
  errorMessage?: string;
}

// ─── Step indicator
function StepIndicator({ current }: { current: WizardStep }) {
  const steps: { key: WizardStep; label: string }[] = [
    { key: "source", label: "Source" },
    { key: "recipient", label: "Recipient" },
    { key: "amount", label: "Amount" },
    { key: "confirm", label: "Confirm" },
  ];

  const order: WizardStep[] = [
    "source",
    "recipient",
    "amount",
    "confirm",
    "success",
  ];
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = step.key === current;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-mono transition-all duration-300",
                  isDone
                    ? "border-gold-500/40 bg-gold-400/15 text-gold-400"
                    : isActive
                      ? "border-gold-500/60 bg-gold-400/20 text-gold-300"
                      : "border-obsidian-600 bg-obsidian-800 text-ash-600",
                )}
              >
                {isDone ? <CheckCircle className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-mono uppercase tracking-[0.2em] sm:block",
                  isActive
                    ? "text-ash-300"
                    : isDone
                      ? "text-gold-500"
                      : "text-ash-700",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-px w-6 transition-colors duration-300",
                  isDone ? "bg-gold-500/40" : "bg-obsidian-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Source Account Selector
function SourceStep({
  accounts,
  selected,
  onSelect,
  onNext,
}: {
  accounts: GoAccount[];
  selected: GoAccount | null;
  onSelect: (a: GoAccount) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ash-50">
          Select source account
        </h2>
        <p className="mt-1.5 text-sm text-ash-500">
          Choose which account to send funds from.
        </p>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => {
          const config = DASHBOARD_CURRENCY_CONFIG[account.currency];
          const isSelected = selected?.id === account.id;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelect(account)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-gold-500/40 bg-gold-400/8 ring-1 ring-gold-500/30"
                  : "border-obsidian-600 bg-obsidian-800/60 hover:border-obsidian-500 hover:bg-obsidian-800",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-2xs uppercase tracking-[0.28em] text-ash-500">
                    {account.currency} account
                  </p>
                  <p className="mt-1 font-display text-lg text-ash-100">
                    {config?.label ?? `${account.currency} Account`}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ash-400">
                    Acct {String(account.id).padStart(4, "0")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-ash-500">Balance</p>
                  <p className="mt-0.5 font-display text-lg text-ash-100">
                    {formatDashboardBalance(account.balance, account.currency)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!selected}
        onClick={onNext}
        className="gap-2"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Recipient Step (with debounced lookup)
function RecipientStep({
  sourceAccount,
  currentUsername,
  lookup,
  recipientId,
  onRecipientIdChange,
  onBack,
  onNext,
}: {
  sourceAccount: GoAccount;
  currentUsername: string;
  lookup: LookupState;
  recipientId: string;
  onRecipientIdChange: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const canProceed = lookup.status === "found";

  const statusContent = () => {
    if (!recipientId || lookup.status === "idle") return null;

    if (lookup.status === "loading") {
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-obsidian-600 bg-obsidian-800/60 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-ash-500" />
          <p className="text-sm text-ash-500">Looking up account…</p>
        </div>
      );
    }

    if (lookup.status === "not_found") {
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">
            Account not found. Please check the ID and try again.
          </p>
        </div>
      );
    }

    if (lookup.status === "same_user") {
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-warning">
            You cannot transfer to your own account.
          </p>
        </div>
      );
    }

    if (lookup.status === "currency_mismatch") {
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="text-sm text-warning">Currency mismatch.</p>
            <p className="mt-0.5 text-xs text-ash-500">
              Source is {sourceAccount.currency}, destination is{" "}
              {lookup.account?.currency}. Both must match.
            </p>
          </div>
        </div>
      );
    }

    if (lookup.status === "error") {
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">
            {lookup.errorMessage ??
              "Could not look up account. Please try again."}
          </p>
        </div>
      );
    }

    if (lookup.status === "found" && lookup.account) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/8 px-4 py-3.5">
          <BadgeCheck className="h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ash-100">Account verified</p>
            <p className="mt-0.5 text-xs text-ash-400">
              Owner:{" "}
              <span className="font-mono text-ash-200">
                @{lookup.account.owner}
              </span>{" "}
              · Currency:{" "}
              <span className="font-mono text-ash-200">
                {lookup.account.currency}
              </span>
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ash-50">Recipient account</h2>
        <p className="mt-1.5 text-sm text-ash-500">
          Enter the destination account ID. Must be another user&apos;s{" "}
          <span className="font-mono text-ash-300">
            {sourceAccount.currency}
          </span>{" "}
          account.
        </p>
      </div>

      <Input
        label="Destination Account ID"
        type="number"
        placeholder="e.g. 42"
        value={recipientId}
        onChange={(e) => onRecipientIdChange(e.target.value)}
        prefix={<Search className="h-4 w-4" />}
        hint="We'll verify the account exists and matches the currency."
      />

      {statusContent()}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1 gap-2"
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Amount Step
function AmountStep({
  sourceAccount,
  recipientAccount,
  amount,
  onAmountChange,
  amountError,
  onBack,
  onNext,
}: {
  sourceAccount: GoAccount;
  recipientAccount: GoAccountLookup;
  amount: string;
  onAmountChange: (v: string) => void;
  amountError: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  const config = DASHBOARD_CURRENCY_CONFIG[sourceAccount.currency];
  const symbol = config?.symbol ?? sourceAccount.currency + " ";
  const balanceMajor = sourceAccount.balance;
  const parsedAmount = parseFloat(amount);
  const isValid =
    amount !== "" &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= balanceMajor;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ash-50">Enter amount</h2>
        <p className="mt-1.5 text-sm text-ash-500">
          How much do you want to send to{" "}
          <span className="font-mono text-ash-300">
            @{recipientAccount.owner}
          </span>
          ?
        </p>
      </div>

      {/* Balance display */}
      <div className="rounded-xl border border-obsidian-600 bg-obsidian-800/40 px-4 py-3">
        <p className="text-xs font-mono uppercase tracking-[0.22em] text-ash-600">
          Available balance
        </p>
        <p className="mt-1 font-display text-xl text-ash-100">
          {formatDashboardBalance(
            sourceAccount.balance,
            sourceAccount.currency,
          )}
        </p>
      </div>

      <Input
        label={`Amount (${sourceAccount.currency})`}
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        prefix={
          <span className="text-ash-400 font-mono text-sm">{symbol}</span>
        }
        hint={`Max: ${symbol}${balanceMajor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        error={amountError ?? undefined}
      />

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1 gap-2"
          disabled={!isValid}
          onClick={onNext}
        >
          Review
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Confirm Step
function ConfirmStep({
  sourceAccount,
  recipientAccount,
  amount,
  isPending,
  error,
  onBack,
  onConfirm,
}: {
  sourceAccount: GoAccount;
  recipientAccount: GoAccountLookup;
  amount: string;
  isPending: boolean;
  error: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const config = DASHBOARD_CURRENCY_CONFIG[sourceAccount.currency];
  const symbol = config?.symbol ?? sourceAccount.currency + " ";
  const parsedAmount = parseFloat(amount);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ash-50">Review transfer</h2>
        <p className="mt-1.5 text-sm text-ash-500">
          Please confirm the details before sending.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-obsidian-600 bg-obsidian-800/40 p-5">
        {/* Amount */}
        <div className="text-center pb-4 border-b border-obsidian-700">
          <p className="text-xs font-mono uppercase tracking-[0.28em] text-ash-600">
            Transfer amount
          </p>
          <p className="mt-2 font-display text-4xl text-ash-50">
            {symbol}
            {parsedAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-1 font-mono text-xs text-ash-500">
            {sourceAccount.currency}
          </p>
        </div>

        {/* From */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-obsidian-600 bg-obsidian-700">
              <ArrowLeftRight className="h-3.5 w-3.5 text-ash-500" />
            </div>
            <div>
              <p className="text-xs text-ash-600">From</p>
              <p className="text-sm text-ash-200">
                {config?.label ?? `${sourceAccount.currency} Account`}
              </p>
            </div>
          </div>
          <p className="font-mono text-xs text-ash-500">
            Acct {String(sourceAccount.id).padStart(4, "0")}
          </p>
        </div>

        {/* To */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-success/20 bg-success/8">
              <User className="h-3.5 w-3.5 text-success" />
            </div>
            <div>
              <p className="text-xs text-ash-600">To</p>
              <p className="text-sm text-ash-200">@{recipientAccount.owner}</p>
            </div>
          </div>
          <p className="font-mono text-xs text-ash-500">
            Acct {String(recipientAccount.id).padStart(4, "0")}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 gap-2"
          onClick={onBack}
          disabled={isPending}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1 gap-2"
          loading={isPending}
          onClick={onConfirm}
        >
          {isPending ? "Sending…" : "Send funds"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// ─── Success Step
function SuccessStep({
  amount,
  currency,
  recipientOwner,
  onReset,
}: {
  amount: string;
  currency: string;
  recipientOwner: string;
  onReset: () => void;
}) {
  const config = DASHBOARD_CURRENCY_CONFIG[currency];
  const symbol = config?.symbol ?? currency + " ";
  const parsedAmount = parseFloat(amount);

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-success/30 bg-success/12">
        <CheckCircle className="h-8 w-8 text-success" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="font-display text-3xl text-ash-50">Transfer complete</h2>
        <p className="mt-2 text-sm text-ash-500">
          {symbol}
          {parsedAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          was sent to{" "}
          <span className="font-mono text-ash-300">@{recipientOwner}</span>{" "}
          successfully.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          onClick={onReset}
        >
          New transfer
        </Button>
      </div>
    </div>
  );
}

// ─── Main Wizard Component
export function TransferWizard({
  accounts,
  currentUsername,
}: TransferWizardProps) {
  const [step, setStep] = useState<WizardStep>("source");
  const [sourceAccount, setSourceAccount] = useState<GoAccount | null>(
    accounts[0] ?? null,
  );
  const [recipientId, setRecipientId] = useState("");
  const [lookup, setLookup] = useState<LookupState>({
    status: "idle",
    account: null,
  });
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounced account lookup
  const handleRecipientIdChange = useCallback(
    (val: string) => {
      setRecipientId(val);
      setLookup({ status: "idle", account: null });

      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = val.trim();
      if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) return;

      setLookup({ status: "loading", account: null });

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/accounts/lookup?id=${encodeURIComponent(trimmed)}`,
          );

          // We call our own Next.js route handler that proxies to the Go API
          // with the session token — this keeps the token server-side.
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            if (res.status === 404) {
              setLookup({ status: "not_found", account: null });
            } else {
              setLookup({
                status: "error",
                account: null,
                errorMessage: body.message ?? "Lookup failed.",
              });
            }
            return;
          }

          const data = await res.json();
          const account: GoAccountLookup = data.account;

          // Business rule: cannot transfer to own account
          if (account.owner === currentUsername) {
            setLookup({ status: "same_user", account });
            return;
          }

          // Business rule: currency must match source
          if (sourceAccount && account.currency !== sourceAccount.currency) {
            setLookup({ status: "currency_mismatch", account });
            return;
          }

          setLookup({ status: "found", account });
        } catch {
          setLookup({
            status: "error",
            account: null,
            errorMessage: "Network error — could not reach the server.",
          });
        }
      }, 500);
    },
    [sourceAccount, currentUsername],
  );

  const handleAmountChange = (val: string) => {
    setAmount(val);
    setAmountError(null);
    if (!sourceAccount) return;
    const parsed = parseFloat(val);
    const balanceMajor = sourceAccount.balance;
    if (val !== "" && (isNaN(parsed) || parsed <= 0)) {
      setAmountError("Amount must be greater than zero.");
    } else if (!isNaN(parsed) && parsed > balanceMajor) {
      setAmountError("Amount exceeds available balance.");
    }
  };

  const handleConfirm = () => {
    if (!sourceAccount || !lookup.account || !amount) return;
    setSubmitError(null);

    startTransition(async () => {
      const result = await createTransferAction({
        fromAccountId: sourceAccount.id,
        toAccountId: Number(lookup.account!.id),
        amount: parseFloat(amount),
        currency: sourceAccount.currency,
      });

      if (result.status === "success") {
        setStep("success");
      } else if (result.status === "error") {
        setSubmitError(result.message);
      }
    });
  };

  const handleReset = () => {
    setStep("source");
    setSourceAccount(accounts[0] ?? null);
    setRecipientId("");
    setLookup({ status: "idle", account: null });
    setAmount("");
    setAmountError(null);
    setSubmitError(null);
  };

  const derivedLookup = (() => {
    if (!lookup.account || !sourceAccount) return lookup;

    // currency mismatch case
    if (lookup.account.currency !== sourceAccount.currency) {
      return { ...lookup, status: "currency_mismatch" as const };
    }

    // recover from mismatch if source changes
    if (
      lookup.status === "currency_mismatch" &&
      lookup.account.currency === sourceAccount.currency
    ) {
      return { ...lookup, status: "found" as const };
    }

    return lookup;
  })();

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {step !== "success" && (
        <div className="flex items-center justify-center">
          <StepIndicator current={step} />
        </div>
      )}

      <div className="min-h-0 flex-1">
        {step === "source" && (
          <SourceStep
            accounts={accounts}
            selected={sourceAccount}
            onSelect={setSourceAccount}
            onNext={() => setStep("recipient")}
          />
        )}
        {step === "recipient" && sourceAccount && (
          <RecipientStep
            sourceAccount={sourceAccount}
            currentUsername={currentUsername}
            lookup={derivedLookup}
            recipientId={recipientId}
            onRecipientIdChange={handleRecipientIdChange}
            onBack={() => setStep("source")}
            onNext={() => setStep("amount")}
          />
        )}
        {step === "amount" && sourceAccount && derivedLookup.account && (
          <AmountStep
            sourceAccount={sourceAccount}
            recipientAccount={derivedLookup.account}
            amount={amount}
            onAmountChange={handleAmountChange}
            amountError={amountError}
            onBack={() => setStep("recipient")}
            onNext={() => setStep("confirm")}
          />
        )}
        {step === "confirm" && sourceAccount && derivedLookup.account && (
          <ConfirmStep
            sourceAccount={sourceAccount}
            recipientAccount={derivedLookup.account}
            amount={amount}
            isPending={isPending}
            error={submitError}
            onBack={() => setStep("amount")}
            onConfirm={handleConfirm}
          />
        )}
        {step === "success" && derivedLookup.account && (
          <SuccessStep
            amount={amount}
            currency={sourceAccount?.currency ?? "USD"}
            recipientOwner={derivedLookup.account.owner}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
