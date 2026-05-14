const PUBLIC_TRACK_EVENTS = new Set(['page_view', 'cta_click']);

export function parseAllowedOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isSecretRequiredForTrackEvent(eventType: string | undefined): boolean {
  if (!eventType) {
    return true;
  }

  return !PUBLIC_TRACK_EVENTS.has(eventType.trim().toLowerCase());
}
