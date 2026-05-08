export const FESTIVAL_TICKET_TYPES = ['domestic', 'international'];
export const FESTIVAL_PAYMENT_STREAMS = ['domestic', 'fcra'];
export const FESTIVAL_PAYMENTS_ENABLED = false;
export const FESTIVAL_PAYMENTS_DISABLED_MESSAGE =
  'Festival pass payments are temporarily paused. Please use general access registration for now.';
export const FESTIVAL_TICKET_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'checked_in',
];

export const FESTIVAL_PRICING = {
  domestic: {
    ticketType: 'domestic',
    paymentStream: 'domestic',
    currency: 'INR',
    baseAmountMinor: 1000000,
    taxAmountMinor: 180000,
    totalAmountMinor: 1180000,
    displayPrice: 'INR 11,800',
    taxable: true,
  },
  international: {
    ticketType: 'international',
    paymentStream: 'fcra',
    currency: 'USD',
    baseAmountMinor: 20000,
    taxAmountMinor: 0,
    totalAmountMinor: 20000,
    displayPrice: 'USD 200',
    taxable: false,
  },
};

export const FESTIVAL_EVENT_COPY = {
  title: 'Trust and Safety India Festival 2026',
  description: 'Full Access Pass (2 Days + 3 Receptions)',
  venue: 'New Delhi, India',
  datesLabel: '13-14 October 2026',
};
