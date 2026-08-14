export const normalizeTrackingNumber = (value?: string | null): string => {
  if (!value) return '';
  return value.trim().replace(/\s+/g, '');
};

export const buildTrackingUrl = (trackingNumber?: string | null): string | null => {
  const tracking = normalizeTrackingNumber(trackingNumber);
  if (!tracking) return null;

  return `https://t.17track.net/es#nums=${encodeURIComponent(tracking)}`;
};
