'use client';

import { useState, type ReactElement } from 'react';

// ─── Props ───────────────────────────────────────────────────────────────────

type AccountActionsMode = 'billing' | 'danger';

interface AccountActionsProps {
  hasSubscription: boolean;
  userEmail: string;
  userPlan: string;
  mode: AccountActionsMode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AccountActions({
  hasSubscription,
  userEmail,
  userPlan,
  mode,
}: AccountActionsProps): ReactElement {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Manage Billing ───────────────────────────────────────────────────────

  const handleManageBilling = async (): Promise<void> => {
    try {
      const res = await fetch('/api/billing/portal');
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      // handled by the anchor fallback below
    }
  };

  // ── Delete Account ───────────────────────────────────────────────────────

  const handleDeleteAccount = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setDeleteError(null);

    if (confirmEmail.trim() !== userEmail) {
      setDeleteError(
        'البريد الإلكتروني غير مطابق. يرجى التأكيد باستخدام بريدك الإلكتروني المسجل.'
      );
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: confirmEmail.trim() }),
      });

      const json = await res.json();

      if (json.error) {
        setDeleteError(
          json.message || 'فشل في حذف الحساب. يرجى المحاولة مرة أخرى.'
        );
        setDeleting(false);
        return;
      }

      // Redirect to login page after successful deletion
      window.location.href = '/login';
    } catch {
      setDeleteError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Billing Mode ───────────────────────────────────────────────── */}
      {mode === 'billing' && (
        <>
          {hasSubscription && (
            <button
              type="button"
              id="manage-billing-btn"
              className="flex h-11 items-center justify-center rounded-lg border border-surface-border bg-surface-card px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white/5 lg:h-10"
              onClick={handleManageBilling}
            >
              إدارة الفوترة
            </button>
          )}

          {userPlan !== 'agency' && (
            <a
              href="/pricing"
              className="flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90 lg:h-10"
            >
              ترقية الخطة
            </a>
          )}
        </>
      )}

      {/* ── Danger Mode ────────────────────────────────────────────────── */}
      {mode === 'danger' && (
        <>
          {/* Delete Account Section */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-semibold text-error lg:text-2xl">
                منطقة الخطر
              </h2>
              <div className="h-px flex-1 bg-error/20" />
            </div>

            <div className="rounded-xl border border-error/20 bg-error/5 p-4 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text-primary lg:text-lg">
                    حذف الحساب
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    سيؤدي حذف حسابك إلى إزالة جميع الموجزات والمواقع الإلكترونية
                    والبيانات المرتبطة بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                  </p>
                </div>
                <button
                  type="button"
                  id="delete-account-btn"
                  className="flex h-11 shrink-0 items-center justify-center rounded-lg border border-error/40 px-4 text-sm font-medium text-error transition-colors hover:bg-error/10 lg:h-10"
                  onClick={(): void => setDialogVisible(true)}
                >
                  حذف الحساب
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Dialog */}
          {dialogVisible && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setDialogVisible(false);
                  setDeleteError(null);
                  setConfirmEmail('');
                }
              }}
            >
              <div
                className="mx-4 w-full max-w-md rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 text-center">
                  <div className="mb-3 text-4xl">⚠️</div>
                  <h3 className="text-lg font-bold text-text-primary">
                    تأكيد حذف الحساب
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك
                    بما في ذلك الموجزات والمواقع الإلكترونية.
                  </p>
                </div>

                <p className="mb-2 text-sm text-text-secondary">
                  يرجى كتابة بريدك الإلكتروني{' '}
                  <strong className="text-text-primary">{userEmail}</strong>{' '}
                  للتأكيد:
                </p>

                <form onSubmit={handleDeleteAccount}>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    required
                    placeholder="example@email.com"
                    className="h-11 w-full rounded-lg border border-surface-border bg-surface-card px-4 text-base text-text-primary placeholder-text-muted transition-colors focus:border-error focus:outline-none focus:ring-1 focus:ring-error lg:h-10 lg:text-sm"
                    inputMode="email"
                    autoComplete="email"
                  />

                  {deleteError && (
                    <p className="mt-2 text-sm text-error" role="alert">
                      {deleteError}
                    </p>
                  )}

                  <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:justify-end">
                    <button
                      type="button"
                      className="flex h-11 items-center justify-center rounded-lg border border-surface-border bg-surface-card px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white/5 lg:h-10"
                      onClick={(): void => {
                        setDialogVisible(false);
                        setDeleteError(null);
                        setConfirmEmail('');
                      }}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={deleting}
                      className="flex h-11 items-center justify-center rounded-lg bg-error px-4 text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50 lg:h-10"
                    >
                      {deleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
