export const Events = {
  PAGE_VIEW: 'PAGE_VIEW',
  CLICK_WHATSAPP: 'CLICK_WHATSAPP',
  CLICK_INSTAGRAM: 'CLICK_INSTAGRAM',
  CLICK_COURSE: 'CLICK_COURSE',
  GENERATE_DISCOUNT_TICKET: 'GENERATE_DISCOUNT_TICKET',
  OPEN_MAP: 'OPEN_MAP',
  START_FUTURE_SIMULATOR: 'START_FUTURE_SIMULATOR',
  COMPLETE_FUTURE_SIMULATOR: 'COMPLETE_FUTURE_SIMULATOR',
} as const;

export type TrackingEvent = typeof Events[keyof typeof Events];

export interface TrackingPayload {
  event: TrackingEvent;
  course?: string;
  ticket?: string;
  origin?: string;
  [key: string]: unknown;
}

export function track(payload: TrackingPayload): void {
  if (typeof window === 'undefined') return;

  const { event, ...params } = payload;

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, params);
  }
}

// Eventos padrão Meta (otimizáveis por campanha): Lead, Contact, ViewContent, etc.
export function trackMeta(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, params ?? {});
  }
}

// Eventos OpenAI Ads Pixel
export function trackOpenAI(
  eventName: string,
  eventProps?: Record<string, unknown>,
  eventOptions?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.oaiq === 'function') {
    window.oaiq('measure', eventName, eventProps ?? {}, eventOptions ?? {});
  }
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    oaiq?: (...args: unknown[]) => void;
  }
}
