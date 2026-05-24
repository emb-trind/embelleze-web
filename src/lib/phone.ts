/** Normaliza para dígitos puros com código de país 55. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

/** Mascara o número para logs — nunca expõe mais do que os últimos 4 dígitos. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `****${digits.slice(-4)}` : "****";
}

export function isValidBrazilPhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return digits.length >= 12 && digits.length <= 13;
}
