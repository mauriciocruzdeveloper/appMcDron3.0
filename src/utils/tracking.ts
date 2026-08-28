export const normalizeTrackingNumber = (value?: string | null): string => {
  if (!value) return '';
  return value.trim().replace(/\s+/g, '');
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

export const isMailAmericasTrackingNumber = (trackingNumber?: string | null): boolean => {
  const tracking = normalizeTrackingNumber(trackingNumber);
  if (!tracking) return false;
  return /^MLAR[A-Z0-9]+$/i.test(tracking) || /^ML[A-Z0-9]{8,25}$/i.test(tracking);
};

export const buildMailAmericasTrackingUrl = (trackingNumber?: string | null): string | null => {
  if (!isMailAmericasTrackingNumber(trackingNumber)) return null;

  const tracking = normalizeTrackingNumber(trackingNumber);
  return `https://mailamericas.com/tracking?number_id=${encodeURIComponent(tracking)}`;
};

export const buildTrackingUrl = (trackingNumber?: string | null): string | null => {
  const tracking = normalizeTrackingNumber(trackingNumber);
  if (!tracking) return null;

  if (isMailAmericasTrackingNumber(tracking)) {
    return buildMailAmericasTrackingUrl(tracking);
  }
  if (isAndreaniTrackingNumber(tracking)) {
    return buildAndreaniTrackingUrl(tracking);
  }

  return `https://parcelsapp.com/es/tracking/${encodeURIComponent(tracking)}`;
};
