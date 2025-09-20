export const getPgErrorCode = (err: unknown): string | undefined =>
  (err as { code?: string })?.code ??
  (err as { cause?: { code?: string } })?.cause?.code;

export const getPgConstraint = (err: unknown): string | undefined =>
  (err as { constraint?: string })?.constraint ??
  (err as { cause?: { constraint?: string } })?.cause?.constraint;
