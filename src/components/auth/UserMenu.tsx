'use client';

import { useCallback, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User as UserIcon, LayoutDashboard, CreditCard, LogOut } from 'lucide-react';
import { signOutAction } from '@/app/login/actions';
import { getInitials } from '@/lib/utils';
import type { SessionUser, PlanType } from '@/types';

// ─── Plan Badge Config ───────────────────────────────────────────────────────

const PLAN_BADGE: Record<PlanType, { label: string; className: string }> = {
  none: { label: 'No Plan', className: 'bg-gray-500/20 text-gray-400' },
  starter: { label: 'Starter', className: 'bg-blue-500/20 text-blue-400' },
  pro: { label: 'Pro', className: 'bg-violet-500/20 text-violet-400' },
  agency: { label: 'Agency', className: 'bg-amber-500/20 text-amber-400' },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface UserMenuProps {
  user: SessionUser;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UserMenu({ user }: UserMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const initials = getInitials(user.name);
  const planBadge = PLAN_BADGE[user.plan ?? 'none'];

  const handleSignOut = useCallback(async (): Promise<void> => {
    await signOutAction();
  }, []);

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Avatar Trigger */}
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-text-primary transition-all hover:bg-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card active:scale-95 lg:h-10 lg:w-10"
          aria-label="User menu"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ''}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Menu Content */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-2xl"
        >
          {/* User Info Header */}
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-text-primary">
              {user.name ?? 'User'}
            </p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
            <div className="mt-1.5">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${planBadge.className}`}
              >
                {planBadge.label}
              </span>
            </div>
          </div>

          <DropdownMenu.Separator className="mx-2 my-1 h-px bg-surface-border" />

          {/* Dashboard */}
          <DropdownMenu.Item asChild>
            <a
              href="/dashboard"
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:outline-none"
            >
              <LayoutDashboard size={16} className="shrink-0 text-text-muted" />
              <span>Dashboard</span>
            </a>
          </DropdownMenu.Item>

          {/* Account & Billing */}
          <DropdownMenu.Item asChild>
            <a
              href="/dashboard/billing"
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:outline-none"
            >
              <CreditCard size={16} className="shrink-0 text-text-muted" />
              <span>Account & Billing</span>
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="mx-2 my-1 h-px bg-surface-border" />

          {/* Sign Out */}
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-error transition-colors hover:bg-error/10 focus:bg-error/10 focus:outline-none"
            >
              <LogOut size={16} className="shrink-0" />
              <span>Sign Out</span>
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-surface-border" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
