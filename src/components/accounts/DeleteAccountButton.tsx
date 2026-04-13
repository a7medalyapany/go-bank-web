"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { deleteAccountAction } from "@/lib/actions/accounts";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DeleteAccountButtonProps {
  accountId: number;
  accountLabel: string;
}

export function DeleteAccountButton({
  accountId,
  accountLabel,
}: DeleteAccountButtonProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openConfirm() {
    setMenuOpen(false);
    setConfirmOpen(true);
    requestAnimationFrame(() => {
      dialogRef.current?.showModal();
    });
  }

  function closeConfirm() {
    dialogRef.current?.close();
    setConfirmOpen(false);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccountAction(accountId);

      if (result.ok) {
        closeConfirm();
        // FIX: Show success toast THEN refresh. This ensures the user sees
        // feedback before the page re-renders, preventing a jarring blank state.
        toast.success(`${accountLabel} closed successfully.`);
        // router.refresh() re-fetches RSC data so the deleted card disappears.
        // The Server Action already called revalidatePath("/accounts").
        router.refresh();
      } else {
        // FIX: Close confirm first, THEN show error. Previously the dialog
        // would close but the toast appeared before the dialog animation
        // finished, which felt janky.
        closeConfirm();
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Account options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/6 bg-white/3 text-ash-500 transition-colors hover:border-white/12 hover:text-ash-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            {/* FIX: Added pointer-events overlay to catch outside clicks reliably.
                Previously this would sometimes fail if the user clicked on
                a child element of the overlay. */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-obsidian-600 bg-obsidian-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={openConfirm}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Close account
              </button>
            </div>
          </>
        )}
      </div>

      {confirmOpen && (
        <dialog
          ref={dialogRef}
          onCancel={closeConfirm}
          className={cn(
            "fixed inset-0 m-0 h-full w-full max-w-none max-h-none p-0",
            "bg-transparent backdrop:bg-obsidian-950/70 backdrop:backdrop-blur-sm",
            "open:flex open:items-center open:justify-center",
          )}
          onClick={(e) => {
            if (e.target === dialogRef.current) closeConfirm();
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-[24px] border border-obsidian-600 bg-obsidian-900 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/20 bg-danger/8">
              <AlertTriangle
                className="h-5 w-5 text-danger"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mt-5 font-display text-xl text-ash-50">
              Close this account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ash-400">
              <span className="text-ash-200">{accountLabel}</span> will be
              permanently deleted. This cannot be undone. Make sure the balance
              is zero before proceeding.
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={closeConfirm}
                disabled={isPending}
              >
                Keep account
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                loading={isPending}
                onClick={handleDelete}
              >
                {isPending ? "Closing…" : "Close account"}
              </Button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
