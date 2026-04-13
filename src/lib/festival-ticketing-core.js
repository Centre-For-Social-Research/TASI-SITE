import { FESTIVAL_PRICING } from './festival-ticketing-constants.js';

function normalizeCountryCode(country) {
  return String(country || '')
    .trim()
    .toUpperCase();
}

export function getFestivalTicketTypeForCountry(country) {
  return normalizeCountryCode(country) === 'IN' ? 'domestic' : 'international';
}

export function deriveFestivalTicketPurchaseDetails({ country }) {
  const ticketType = getFestivalTicketTypeForCountry(country);
  return {
    ...FESTIVAL_PRICING[ticketType],
  };
}

export function getFestivalTicketCountryLabel(country) {
  return normalizeCountryCode(country) === 'IN'
    ? 'India'
    : normalizeCountryCode(country);
}
