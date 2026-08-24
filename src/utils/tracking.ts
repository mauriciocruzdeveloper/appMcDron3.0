export const normalizeTrackingNumber = (value?: string | null): string => {
  if (!value) return '';
  return value.trim().replace(/\s+/g, '');
};

export const buildTrackingUrl = (trackingNumber?: string | null): string | null => {
  const tracking = normalizeTrackingNumber(trackingNumber);
  if (!tracking) return null;

  return `https://t.17track.net/es#nums=${encodeURIComponent(tracking)}`;
};

export const isAndreaniTrackingNumber = (trackingNumber?: string | null): boolean => {
  const tracking = normalizeTrackingNumber(trackingNumber);
  return /^\d{15}$/.test(tracking);
};

export const buildAndreaniTrackingUrl = (trackingNumber?: string | null): string | null => {
  if (!isAndreaniTrackingNumber(trackingNumber)) return null;

  const tracking = normalizeTrackingNumber(trackingNumber);
  return `https://www.andreani.com/envio/${encodeURIComponent(tracking)}`;
};
