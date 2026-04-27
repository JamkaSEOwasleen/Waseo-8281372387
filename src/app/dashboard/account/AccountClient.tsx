'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { Button } from '@/components/ui/Button';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface AccountClientProps {
  userId: string;
  initialName: string | null;
  email: string;
  avatarUrl: string | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AccountClient({
  userId: _userId,
  initialName,
  email: _email,
  avatarUrl: _avatarUrl,
}: AccountClientProps): ReactElement {
  const [name, setName] = useState<string>(initialName ?? '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Save Name Handler ──────────────────────────────────────────────────────
  const handleSaveName = useCallback(async (): Promise<void> => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();

      if (json.error) {
        setSaveError(json.message || 'Failed to update name');
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name]);

  return (
    <div className="space-y-4">
      {/* Name field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="profile-name"
          className="text-sm font-medium text-text-primary"
        >
          Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="h-11 w-full rounded-lg border border-surface-border bg-surface-card px-4 text-base text-text-primary placeholder-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:h-10 lg:text-sm"
          inputMode="text"
        />
      </div>

      {/* Email (read-only) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">
          Email
        </label>
        <div className="h-11 flex items-center rounded-lg border border-surface-border bg-white/5 px-4 text-base text-text-muted lg:h-10 lg:text-sm">
          {_email}
        </div>
        <p className="text-xs text-text-muted">
          Email is linked to your account and cannot be changed
        </p>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          isLoading={saving}
          onClick={handleSaveName}
          disabled={name === (initialName ?? '') || !name.trim()}
        >
          Save Changes
        </Button>

        {saveSuccess && (
          <span className="text-sm text-success">Saved successfully ✓</span>
        )}

        {saveError && (
          <span className="text-sm text-error" role="alert">
            {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
