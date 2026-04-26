'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProvidersProps {
  children: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Providers({ children }: ProvidersProps): React.ReactElement {
  return <SessionProvider>{children}</SessionProvider>;
}
