import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { summarizeTicketAvailability } from '@/lib/ticketing-availability';
import { TICKET_ORDER_HOLD_MINUTES } from '@/lib/ticketing-constants';
import {
  buildTicketCode,
  buildTicketOrderCode,
  buildTicketQrPayload,
  buildTicketQrToken,
  normalizeTicketEmail,
  normalizeTicketName,
  normalizeTicketPhone,
} from '@/lib/ticketing-utils';

function nowIso() {
  return new Date().toISOString();
}

function isTicketTypeOnSale(ticketType, now = new Date()) {
  const nowMs = new Date(now).getTime();
  const saleStartsAt = ticketType.sale_starts_at
    ? new Date(ticketType.sale_starts_at).getTime()
    : null;
  const saleEndsAt = ticketType.sale_ends_at
    ? new Date(ticketType.sale_ends_at).getTime()
    : null;

  if (!ticketType.is_active) return false;
  if (saleStartsAt && saleStartsAt > nowMs) return false;
  if (saleEndsAt && saleEndsAt < nowMs) return false;
  return true;
}

function mapTicketType(row, availabilitySummary) {
  return {
    id: row.id,
    tierKey: row.tier_key,
    name: row.name,
    description: row.description,
    ticketMode: row.ticket_mode,
    pricePaise: row.price_paise,
    minDonationPaise: row.min_donation_paise,
    capacity: row.capacity,
    perOrderLimit: row.per_order_limit,
    saleStartsAt: row.sale_starts_at,
    saleEndsAt: row.sale_ends_at,
    isActive: row.is_active,
    displayOrder: row.display_order,
    shortDescription: row.short_description || '',
    badgePattern: row.badge_pattern || 'default',
    availability: availabilitySummary,
  };
}

async function listSoldQuantities(ticketTypeIds) {
  if (!ticketTypeIds.length) return new Map();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_order_items')
    .select('ticket_type_id, quantity, ticket_orders!inner(status)')
    .in('ticket_type_id', ticketTypeIds)
    .eq('ticket_orders.status', 'paid');

  if (error) throw new Error(error.message);

  const totals = new Map();
  for (const row of data || []) {
    totals.set(
      row.ticket_type_id,
      (totals.get(row.ticket_type_id) || 0) + Number(row.quantity || 0)
    );
  }

  return totals;
}

async function listActiveHolds(ticketTypeIds) {
  if (!ticketTypeIds.length) return new Map();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_inventory_holds')
    .select('ticket_type_id, quantity, expires_at')
    .in('ticket_type_id', ticketTypeIds)
    .gt('expires_at', nowIso());

  if (error) throw new Error(error.message);

  const grouped = new Map();
  for (const row of data || []) {
    const current = grouped.get(row.ticket_type_id) || [];
    current.push(row);
    grouped.set(row.ticket_type_id, current);
  }

  return grouped;
}

async function buildAvailabilityMap(ticketTypeRows) {
  const ticketTypeIds = ticketTypeRows.map((row) => row.id);
  const [soldQuantities, activeHolds] = await Promise.all([
    listSoldQuantities(ticketTypeIds),
    listActiveHolds(ticketTypeIds),
  ]);

  const availability = new Map();
  for (const row of ticketTypeRows) {
    availability.set(
      row.id,
      summarizeTicketAvailability({
        capacity: row.capacity,
        soldQuantity: soldQuantities.get(row.id) || 0,
        holds: activeHolds.get(row.id) || [],
      })
    );
  }

  return availability;
}

export async function listPublicTicketEvents() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_events')
    .select(
      'id, slug, title, description, venue, starts_at, ends_at, timezone, currency, status, ui_variant, hero_label, ticket_types(*)'
    )
    .eq('status', 'published')
    .order('starts_at', { ascending: true });

  if (error) throw new Error(error.message);

  const events = data || [];
  const allTicketTypes = events.flatMap((event) => event.ticket_types || []);
  const availabilityMap = await buildAvailabilityMap(allTicketTypes);

  return events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    timezone: event.timezone,
    currency: event.currency,
    heroLabel: event.hero_label,
    ticketTypes: (event.ticket_types || [])
      .map((ticketType) => ({
        ...mapTicketType(ticketType, availabilityMap.get(ticketType.id)),
        isOnSale: isTicketTypeOnSale(ticketType),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));
}

export async function createTicketEvent({ event, ticketTypes, operator }) {
  const supabase = getSupabaseAdmin();
  const { data: createdEvent, error: eventError } = await supabase
    .from('ticket_events')
    .insert({
      slug: event.slug,
      title: event.title,
      description: event.description,
      venue: event.venue,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
      timezone: event.timezone,
      status: event.status,
      hero_label: event.heroLabel,
      created_by_clerk_id: operator.userId,
      created_by_email: operator.primaryEmail,
      updated_at: nowIso(),
    })
    .select('*')
    .single();

  if (eventError) throw new Error(eventError.message);

  const rows = ticketTypes.map((ticketType) => ({
    event_id: createdEvent.id,
    tier_key: ticketType.tierKey,
    name: ticketType.name,
    description: ticketType.description,
    ticket_mode: ticketType.ticketMode,
    price_paise: ticketType.pricePaise,
    min_donation_paise: ticketType.minDonationPaise,
    capacity: ticketType.capacity,
    per_order_limit: ticketType.perOrderLimit,
    sale_starts_at: ticketType.saleStartsAt,
    sale_ends_at: ticketType.saleEndsAt,
    is_active: ticketType.isActive,
    display_order: ticketType.displayOrder,
    badge_pattern: ticketType.badgePattern,
    short_description: ticketType.shortDescription,
    updated_at: nowIso(),
  }));

  const { data: createdTypes, error: ticketTypeError } = await supabase
    .from('ticket_types')
    .insert(rows)
    .select('*');

  if (ticketTypeError) throw new Error(ticketTypeError.message);

  return {
    event: createdEvent,
    ticketTypes: createdTypes || [],
  };
}

export async function updateTicketEvent({ eventId, updates }) {
  const supabase = getSupabaseAdmin();

  if (updates.status) {
    const { error } = await supabase
      .from('ticket_events')
      .update({
        status: updates.status,
        updated_at: nowIso(),
      })
      .eq('id', eventId);

    if (error) throw new Error(error.message);
  }

  for (const ticketType of updates.ticketTypes || []) {
    const { error } = await supabase
      .from('ticket_types')
      .update({
        ...(ticketType.capacity != null
          ? { capacity: ticketType.capacity }
          : {}),
        ...(ticketType.saleStartsAt !== undefined
          ? { sale_starts_at: ticketType.saleStartsAt }
          : {}),
        ...(ticketType.saleEndsAt !== undefined
          ? { sale_ends_at: ticketType.saleEndsAt }
          : {}),
        ...(ticketType.isActive !== undefined
          ? { is_active: ticketType.isActive }
          : {}),
        updated_at: nowIso(),
      })
      .eq('id', ticketType.id)
      .eq('event_id', eventId);

    if (error) throw new Error(error.message);
  }
}

export async function getTicketEventForCheckout(eventId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_events')
    .select(
      'id, slug, title, description, venue, starts_at, ends_at, timezone, currency, status, hero_label, ticket_types(*)'
    )
    .eq('id', eventId)
    .single();

  if (error) throw new Error(error.message);

  const availabilityMap = await buildAvailabilityMap(data.ticket_types || []);

  return {
    ...data,
    ticket_types: (data.ticket_types || []).map((ticketType) => ({
      ...ticketType,
      availability: availabilityMap.get(ticketType.id),
      is_on_sale: isTicketTypeOnSale(ticketType),
    })),
  };
}

export async function getOrCreateTicketCustomer(buyer) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = normalizeTicketEmail(buyer.email);
  const normalizedPhone = normalizeTicketPhone(buyer.phone);
  const fullName = normalizeTicketName(buyer.fullName, 'Buyer name');

  const { data: existingCustomer, error: existingError } = await supabase
    .from('ticket_customers')
    .select('*')
    .eq('normalized_email', normalizedEmail)
    .eq('normalized_phone', normalizedPhone)
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existingCustomer) return existingCustomer;

  const { data, error } = await supabase
    .from('ticket_customers')
    .insert({
      full_name: fullName,
      email: buyer.email,
      phone: buyer.phone,
      normalized_email: normalizedEmail,
      normalized_phone: normalizedPhone,
      updated_at: nowIso(),
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function findOrderByIdempotencyKey(idempotencyKey) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_orders')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createTicketOrder({
  event,
  buyer,
  customer,
  pricing,
  ticketSelections,
  idempotencyKey,
  providerOrderId = null,
}) {
  const supabase = getSupabaseAdmin();
  const holdExpiresAt = new Date(
    Date.now() + TICKET_ORDER_HOLD_MINUTES * 60 * 1000
  ).toISOString();

  const { data: createdOrder, error: orderError } = await supabase
    .from('ticket_orders')
    .insert({
      public_order_code: buildTicketOrderCode(),
      event_id: event.id,
      customer_id: customer.id,
      status: pricing.totalPaise > 0 ? 'payment_pending' : 'pending',
      currency: event.currency || 'INR',
      subtotal_paise: pricing.subtotalPaise,
      donation_paise: pricing.donationPaise,
      total_paise: pricing.totalPaise,
      buyer_name: buyer.fullName,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      normalized_buyer_email: normalizeTicketEmail(buyer.email),
      normalized_buyer_phone: normalizeTicketPhone(buyer.phone),
      payment_provider: pricing.totalPaise > 0 ? 'razorpay' : null,
      provider_order_id: providerOrderId,
      hold_expires_at: holdExpiresAt,
      idempotency_key: idempotencyKey,
      metadata: {},
      updated_at: nowIso(),
    })
    .select('*')
    .single();

  if (orderError) throw new Error(orderError.message);

  const itemRows = pricing.lineItems.map((lineItem, index) => ({
    order_id: createdOrder.id,
    ticket_type_id: lineItem.ticketTypeId,
    quantity: lineItem.quantity,
    unit_amount_paise: lineItem.unitAmountPaise,
    line_total_paise: lineItem.lineTotalPaise,
    ticket_mode: lineItem.ticketMode,
    donation_paise:
      lineItem.ticketMode === 'donation' ? lineItem.lineTotalPaise : 0,
    attendee_payload: ticketSelections[index].attendees,
  }));

  const { error: itemError } = await supabase
    .from('ticket_order_items')
    .insert(itemRows);

  if (itemError) throw new Error(itemError.message);

  const holdRows = pricing.lineItems.map((lineItem) => ({
    order_id: createdOrder.id,
    ticket_type_id: lineItem.ticketTypeId,
    quantity: lineItem.quantity,
    expires_at: holdExpiresAt,
  }));

  const { error: holdError } = await supabase
    .from('ticket_inventory_holds')
    .insert(holdRows);

  if (holdError) throw new Error(holdError.message);

  return createdOrder;
}

export async function setOrderProviderOrderId(orderId, providerOrderId) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('ticket_orders')
    .update({
      provider_order_id: providerOrderId,
      updated_at: nowIso(),
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

export async function getTicketOrder(orderId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_orders')
    .select(
      '*, ticket_events(*), ticket_order_items(*, ticket_types(*)), tickets(*)'
    )
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketOrderByProviderOrderId(providerOrderId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_orders')
    .select(
      '*, ticket_events(*), ticket_order_items(*, ticket_types(*)), tickets(*)'
    )
    .eq('provider_order_id', providerOrderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createOrUpdateTicketPayment({
  orderId,
  providerOrderId,
  providerPaymentId,
  providerSignature,
  amountPaise,
  status,
  payload,
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_payments')
    .upsert(
      {
        order_id: orderId,
        provider_order_id: providerOrderId,
        provider_payment_id: providerPaymentId,
        provider_signature: providerSignature,
        amount_paise: amountPaise,
        status,
        payload,
        updated_at: nowIso(),
      },
      {
        onConflict: 'provider_payment_id',
      }
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function issueTicketsForOrder(orderId) {
  const supabase = getSupabaseAdmin();
  const order = await getTicketOrder(orderId);

  if ((order.tickets || []).length > 0) {
    return order.tickets;
  }

  const ticketRows = [];
  for (const item of order.ticket_order_items || []) {
    const attendees = Array.isArray(item.attendee_payload)
      ? item.attendee_payload
      : [];
    for (const attendee of attendees) {
      const qrToken = buildTicketQrToken();
      const ticketCode = buildTicketCode();
      ticketRows.push({
        order_id: order.id,
        event_id: order.event_id,
        ticket_type_id: item.ticket_type_id,
        ticket_code: ticketCode,
        attendee_name: normalizeTicketName(attendee.fullName, 'Attendee name'),
        attendee_email: attendee.email,
        attendee_phone: attendee.phone,
        normalized_attendee_email: normalizeTicketEmail(attendee.email),
        normalized_attendee_phone: normalizeTicketPhone(attendee.phone),
        status: 'issued',
        qr_token: qrToken,
        qr_payload: buildTicketQrPayload({
          ticket_code: ticketCode,
          qr_token: qrToken,
          event_id: order.event_id,
        }),
        updated_at: nowIso(),
      });
    }
  }

  const { data: createdTickets, error: ticketError } = await supabase
    .from('tickets')
    .insert(ticketRows)
    .select('*, ticket_types(name)');

  if (ticketError) throw new Error(ticketError.message);

  await supabase
    .from('ticket_inventory_holds')
    .delete()
    .eq('order_id', order.id);

  const { error: orderError } = await supabase
    .from('ticket_orders')
    .update({
      status: 'paid',
      updated_at: nowIso(),
    })
    .eq('id', order.id);

  if (orderError) throw new Error(orderError.message);

  return (createdTickets || []).map((ticket) => ({
    ...ticket,
    ticket_type_name: ticket.ticket_types?.name || '',
  }));
}

export async function markTicketOrderFailed(orderId, metadata = {}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('ticket_orders')
    .update({
      status: 'failed',
      metadata,
      updated_at: nowIso(),
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

export async function getTicketsForLookup({ email, phone }) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = normalizeTicketEmail(email);
  const normalizedPhone = normalizeTicketPhone(phone);

  const attendeeLookup = await supabase
    .from('tickets')
    .select(
      'id, order_id, ticket_code, attendee_name, attendee_email, attendee_phone, status, created_at, checked_in_at, ticket_events(title, venue, starts_at), ticket_types(name)'
    )
    .eq('normalized_attendee_email', normalizedEmail)
    .eq('normalized_attendee_phone', normalizedPhone)
    .order('created_at', { ascending: false });

  if (attendeeLookup.error) throw new Error(attendeeLookup.error.message);

  const { data: buyerOrders, error: buyerOrdersError } = await supabase
    .from('ticket_orders')
    .select('id')
    .eq('normalized_buyer_email', normalizedEmail)
    .eq('normalized_buyer_phone', normalizedPhone);

  if (buyerOrdersError) throw new Error(buyerOrdersError.message);

  const buyerOrderIds = (buyerOrders || []).map((order) => order.id);
  let buyerTickets = [];

  if (buyerOrderIds.length) {
    const buyerLookup = await supabase
      .from('tickets')
      .select(
        'id, order_id, ticket_code, attendee_name, attendee_email, attendee_phone, status, created_at, checked_in_at, ticket_events(title, venue, starts_at), ticket_types(name)'
      )
      .in('order_id', buyerOrderIds)
      .order('created_at', { ascending: false });

    if (buyerLookup.error) throw new Error(buyerLookup.error.message);
    buyerTickets = buyerLookup.data || [];
  }

  const deduped = new Map();
  for (const ticket of [...(attendeeLookup.data || []), ...buyerTickets]) {
    deduped.set(ticket.id, ticket);
  }

  return Array.from(deduped.values());
}

export async function listAdminTicketOrders() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_orders')
    .select(
      'id, public_order_code, status, total_paise, buyer_name, buyer_email, buyer_phone, created_at, hold_expires_at, ticket_events(title, venue), ticket_payments(provider_payment_id, status)'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function listAdminTickets() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('tickets')
    .select(
      'id, ticket_code, attendee_name, attendee_email, attendee_phone, status, created_at, checked_in_at, ticket_events(title), ticket_types(name)'
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function recordWebhookEvent({
  dedupeKey,
  providerEventId,
  eventType,
  payload,
  signatureValid,
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ticket_webhook_events')
    .upsert(
      {
        dedupe_key: dedupeKey,
        provider_event_id: providerEventId,
        event_type: eventType,
        payload,
        signature_valid: signatureValid,
        processed_at: nowIso(),
      },
      { onConflict: 'dedupe_key' }
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
