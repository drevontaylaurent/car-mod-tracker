export function normalizeDiagnosticCode(code: string): string {
  return code.trim().toUpperCase();
}

export function validateDiagnosticCode(code: string): string | null {
  const normalizedCode = normalizeDiagnosticCode(code);
  return normalizedCode.length > 0 && normalizedCode.length <= 32
    ? normalizedCode
    : null;
}
