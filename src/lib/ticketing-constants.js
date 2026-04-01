export const TICKET_ORDER_HOLD_MINUTES = 15;

export const TICKET_EVENT_STATUSES = ["draft", "published", "archived"];
export const TICKET_MODES = ["free", "paid", "donation"];
export const TICKET_ORDER_STATUSES = [
  "pending",
  "payment_pending",
  "paid",
  "failed",
  "expired",
  "cancelled",
];
export const TICKET_STATUSES = ["issued", "checked_in", "cancelled", "refunded"];

export const RECEPTION_TICKET_PRESETS = [
  {
    tierKey: "standard",
    name: "Standard",
    ticketMode: "paid",
    badgePattern: "mosaic",
    shortDescription:
      "This ticket is intended for general participants who are in a position to contribute towards their participation and the cost of the event.",
  },
  {
    tierKey: "supporter",
    name: "Supporter",
    ticketMode: "donation",
    badgePattern: "zigzag",
    shortDescription:
      "This ticket is intended for those with additional resources who would like to contribute towards the cost of their participation, as well as support purchases of the Community ticket for those in our community with fewer resources.",
  },
  {
    tierKey: "community",
    name: "Community",
    ticketMode: "free",
    badgePattern: "rings",
    shortDescription:
      "This ticket is intended for community members with limited resources, and for whom ticket fees are a barrier. This ticket is subsidized by Access Now, supported by our sponsors, and by the purchases of the Supporter ticket.",
  },
];

export const DEMO_RECEPTION_EVENT = {
  id: "demo-tasi-2026-opening-reception",
  slug: "tasi-2026-opening-reception",
  title: "TASI 2026 Opening Reception",
  description:
    "An intimate diplomatic evening opening the TASI 2026 reception programme.",
  venue: "New Delhi",
  startsAt: "2026-10-12T18:30:00+05:30",
  endsAt: "2026-10-12T21:00:00+05:30",
  timezone: "Asia/Kolkata",
  currency: "INR",
  heroLabel: "2026 Access",
  ticketTypes: [
    {
      id: "demo-standard",
      tierKey: "standard",
      name: "Standard",
      description: RECEPTION_TICKET_PRESETS[0].shortDescription,
      shortDescription: RECEPTION_TICKET_PRESETS[0].shortDescription,
      ticketMode: "paid",
      pricePaise: 250000,
      minDonationPaise: null,
      capacity: 120,
      perOrderLimit: 6,
      saleStartsAt: "2026-04-01T00:00:00+05:30",
      saleEndsAt: "2026-10-12T17:30:00+05:30",
      isActive: true,
      displayOrder: 0,
      badgePattern: "mosaic",
      isOnSale: true,
      availability: {
        capacity: 120,
        soldQuantity: 18,
        heldQuantity: 4,
        availableQuantity: 98,
        isSoldOut: false,
      },
    },
    {
      id: "demo-supporter",
      tierKey: "supporter",
      name: "Supporter",
      description: RECEPTION_TICKET_PRESETS[1].shortDescription,
      shortDescription: RECEPTION_TICKET_PRESETS[1].shortDescription,
      ticketMode: "donation",
      pricePaise: null,
      minDonationPaise: 500000,
      capacity: 120,
      perOrderLimit: 6,
      saleStartsAt: "2026-04-01T00:00:00+05:30",
      saleEndsAt: "2026-10-12T17:30:00+05:30",
      isActive: true,
      displayOrder: 1,
      badgePattern: "zigzag",
      isOnSale: true,
      availability: {
        capacity: 120,
        soldQuantity: 9,
        heldQuantity: 2,
        availableQuantity: 109,
        isSoldOut: false,
      },
    },
    {
      id: "demo-community",
      tierKey: "community",
      name: "Community",
      description: RECEPTION_TICKET_PRESETS[2].shortDescription,
      shortDescription: RECEPTION_TICKET_PRESETS[2].shortDescription,
      ticketMode: "free",
      pricePaise: null,
      minDonationPaise: null,
      capacity: 40,
      perOrderLimit: 4,
      saleStartsAt: "2026-04-01T00:00:00+05:30",
      saleEndsAt: "2026-10-12T17:30:00+05:30",
      isActive: true,
      displayOrder: 2,
      badgePattern: "rings",
      isOnSale: true,
      availability: {
        capacity: 40,
        soldQuantity: 14,
        heldQuantity: 3,
        availableQuantity: 23,
        isSoldOut: false,
      },
    },
  ],
};
