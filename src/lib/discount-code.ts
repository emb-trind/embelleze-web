const PREFIX = 'BELLA';

export function generateTicket(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${PREFIX}-${timestamp}-${random}`;
}

// BELLA-{base36 timestamp}-{3 base36 chars}
const TICKET_REGEX = /^BELLA-[0-9A-Z]+-[0-9A-Z]{3}$/;

export function isValidTicket(ticket: string): boolean {
  return TICKET_REGEX.test(ticket);
}
