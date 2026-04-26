'use client';

import { useState, useCallback, type ReactElement } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// ─── Props ───────────────────────────────────────────────────────────────────

interface WebsitesListClientProps {
  websiteId: string;
  websiteName: string;
  onDelete: (id: string) => Promise<void>;
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

export function DeleteWebsiteDialog({
  websiteId,
  websiteName,
  onDelete,
}: WebsitesListClientProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (confirmText !== websiteName) return;

    try {
      setIsDeleting(true);
      setError(null);
      await onDelete(websiteId);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete website');
      setIsDeleting(false);
    }
  }, [confirmText, websiteId, websiteName, onDelete]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-error transition-colors hover:bg-error/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
          aria-label={`Delete ${websiteName}`}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
          className={cn(
            'fixed z-50 w-full max-w-lg rounded-t-2xl bg-surface-card p-6 shadow-2xl outline-none',
            'bottom-0 left-0 right-0',
            'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl'
          )}
        >
          {/* Handle bar for mobile */}
          <div className="mb-4 flex justify-center md:hidden">
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <div>
              <Dialog.Title className="text-lg font-semibold text-text-primary">
                Delete Website
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-muted">
                This action cannot be undone. All briefs associated with this
                website will also be deleted.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Confirm */}
          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Type <span className="font-bold text-text-primary">{websiteName}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e): void => setConfirmText(e.target.value)}
              placeholder={websiteName}
              className="h-11 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary placeholder:text-text-muted/40 transition-colors focus:border-error focus:outline-none focus:ring-1 focus:ring-error lg:h-10 lg:text-sm"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-error">{error}</p>
          )}

          <div className="mt-6 flex flex-col gap-2 md:flex-row md:justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary" size="md" fullWidth>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="danger"
              size="md"
              isLoading={isDeleting}
              disabled={confirmText !== websiteName}
              onClick={handleDelete}
              fullWidth
            >
              Delete Website
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

