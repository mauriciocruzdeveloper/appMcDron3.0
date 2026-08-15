export const normalizeCuit = (value?: string | null): string => {
  if (value == null) return '';

  const digits = String(value).replace(/[^\d]/g, '').slice(0, 11);
  return digits;
};

export const isValidCuit = (value?: string | null): boolean => {
  if (value == null) return false;

  const digits = String(value).replace(/[^\d]/g, '');
  if (digits.length !== 11) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0);
  const remainder = 11 - (sum % 11);
  const expectedCheckDigit = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder;

  return Number(digits[10]) === expectedCheckDigit;
};

export const sanitizeCuitInput = (value?: string | null): string => {
  return isValidCuit(value) ? normalizeCuit(value) : '';
};
