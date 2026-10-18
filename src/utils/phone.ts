/**
 * Phone and WhatsApp normalization and link generator for RT Lab
 * Ensures all Egyptian mobile and WhatsApp numbers are properly formatted
 * with the '20' country code so wa.me links always work seamlessly without errors.
 */

export function cleanWhatsAppNumber(phone: string | undefined | null): string {
  if (!phone) return '201021487889';

  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '');

  if (!digits) return '201021487889';

  // If starts with 0020, remove 00
  if (digits.startsWith('0020')) {
    digits = digits.slice(2);
  }

  // If starts with 20 and is 12 digits (standard Egypt international format e.g. 201021487889)
  if (digits.startsWith('20') && digits.length >= 12) {
    return digits;
  }

  // If Egyptian local format starting with 01 (010, 011, 012, 015 - 11 digits)
  if (digits.startsWith('01') && digits.length === 11) {
    return '20' + digits.slice(1);
  }

  // If 10 digits starting with 1 (e.g. 1021487889)
  if (digits.startsWith('1') && digits.length === 10) {
    return '20' + digits;
  }

  // If starts with 0 and has other lengths (e.g. landline or foreign), if in Egypt default to 20
  if (digits.startsWith('0') && digits.length >= 9) {
    return '20' + digits.slice(1);
  }

  return digits;
}

export function formatPhoneDisplay(phone: string | undefined | null): string {
  if (!phone) return '01021487889';
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('201') && clean.length === 12) {
    return '0' + clean.slice(2);
  }
  return phone.trim();
}

export function formatInternationalDisplay(phone: string | undefined | null): string {
  const norm = cleanWhatsAppNumber(phone);
  if (norm.startsWith('20') && norm.length === 12) {
    // 20 102 148 7889
    return `+20 ${norm.slice(2, 5)} ${norm.slice(5, 8)} ${norm.slice(8)}`;
  }
  return `+${norm}`;
}

export function getWhatsAppUrl(phone: string | undefined | null, message?: string): string {
  const clean = cleanWhatsAppNumber(phone);
  if (message && message.trim().length > 0) {
    return `https://wa.me/${clean}?text=${encodeURIComponent(message.trim())}`;
  }
  return `https://wa.me/${clean}`;
}

export function getTelUrl(phone: string | undefined | null): string {
  if (!phone) return 'tel:01021487889';
  const raw = phone.replace(/[^\d+]/g, '');
  return `tel:${raw}`;
}

export function isValidEgyptianMobile(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  // Matches 010..., 011..., 012..., 015... or 2010..., 2011..., etc.
  return /^(?:20|0)?1[0125]\d{8}$/.test(digits);
}
