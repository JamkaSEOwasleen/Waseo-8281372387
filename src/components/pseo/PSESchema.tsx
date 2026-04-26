import type { ReactElement } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PSESchemaProps {
  schema: Record<string, unknown> | null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PSESchema({ schema }: PSESchemaProps): ReactElement {
  if (!schema) {
    return <></>;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
