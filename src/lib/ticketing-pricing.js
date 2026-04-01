function toFiniteNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) {
      return NaN;
    }

    return Number(normalized);
  }

  return NaN;
}

export function amountInrToPaise(value) {
  const amount = toFiniteNumber(value);

  if (!Number.isFinite(amount)) {
    throw new Error("Please enter a valid amount in INR.");
  }

  if (amount <= 0) {
    throw new Error("Donation amount must be greater than zero.");
  }

  return Math.round(amount * 100);
}

function normalizeQuantity(value) {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Ticket quantity must be a positive whole number.");
  }

  return quantity;
}

function resolveUnitAmountPaise({ ticketType, donationAmountInr }) {
  const mode = String(ticketType?.ticket_mode || "free").toLowerCase();

  if (mode === "free") {
    return 0;
  }

  if (mode === "paid") {
    const fixedPrice = Number(ticketType?.price_paise);
    if (!Number.isInteger(fixedPrice) || fixedPrice < 0) {
      throw new Error("Paid tickets must have a valid fixed price.");
    }

    return fixedPrice;
  }

  if (mode === "donation") {
    const amountPaise = amountInrToPaise(donationAmountInr);
    const minimumDonation = Number(ticketType?.min_donation_paise || 0);

    if (!Number.isInteger(minimumDonation) || minimumDonation < 0) {
      throw new Error("Donation tickets must have a valid minimum donation.");
    }

    if (amountPaise < minimumDonation) {
      throw new Error("Donation amount is below the minimum donation.");
    }

    return amountPaise;
  }

  throw new Error(`Unsupported ticket mode: ${mode}`);
}

export function buildOrderPricing({ ticketSelections = [] } = {}) {
  const lineItems = ticketSelections.map((selection) => {
    const ticketType = selection?.ticketType || {};
    const quantity = normalizeQuantity(selection?.quantity);
    const unitAmountPaise = resolveUnitAmountPaise({
      ticketType,
      donationAmountInr: selection?.donationAmountInr,
    });

    return {
      ticketTypeId: ticketType.id || null,
      quantity,
      unitAmountPaise,
      lineTotalPaise: unitAmountPaise * quantity,
      ticketMode: String(ticketType.ticket_mode || "free").toLowerCase(),
    };
  });

  const subtotalPaise = lineItems.reduce(
    (total, lineItem) => total + lineItem.lineTotalPaise,
    0,
  );

  return {
    lineItems,
    subtotalPaise,
    donationPaise: lineItems
      .filter((lineItem) => lineItem.ticketMode === "donation")
      .reduce((total, lineItem) => total + lineItem.lineTotalPaise, 0),
    totalPaise: subtotalPaise,
  };
}
