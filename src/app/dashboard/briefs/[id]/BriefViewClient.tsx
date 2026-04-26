'use client';

import { useState, useCallback, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import BriefResults from '@/components/brief/BriefResults';
import type { BriefOutput, SchemaOutput } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface BriefViewClientProps {
  brief: BriefOutput;
  schema: SchemaOutput;
  briefId: string;
  keyword: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BriefViewClient({
  brief,
  schema,
  briefId,
  keyword,
}: BriefViewClientProps): ReactElement {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Delete Handler ────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (): Promise<void> => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/briefs/${briefId}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (json.error) {
        setDeleteError(json.message || 'فشل في حذف الموجز');
        setDeleting(false);
        return;
      }

      // Success — navigate back to briefs list
      router.push('/dashboard/briefs');
    } catch {
      setDeleteError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      setDeleting(false);
    }
  }, [briefId, router]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Brief Results Tabs */}
      <BriefResults brief={brief} schema={schema} briefId={briefId} />

      {/* ── Action Buttons ───────────────────────────────────────────────── */}
      <Card padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-text-muted">
            <span>هل تريد إنشاء موجز مشابه أو حذف هذا الموجز؟</span>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            {/* Generate Similar */}
            <Link href={`/dashboard/generate?keyword=${encodeURIComponent(keyword)}`}>
              <Button variant="secondary" size="sm" fullWidth>
                إنشاء موجز مشابه
              </Button>
            </Link>

            {/* Delete */}
            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => setShowDeleteConfirm(true)}
              >
                حذف الموجز
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deleting}
                  onClick={handleDelete}
                >
                  تأكيد الحذف
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Delete error */}
        {deleteError && (
          <p className="mt-2 text-sm text-error">{deleteError}</p>
        )}
      </Card>
    </div>
  );
}
