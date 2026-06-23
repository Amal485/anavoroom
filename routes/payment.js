const express = require('express');
const router  = express.Router();
const db      = require('../db/schema');
const crypto  = require('crypto');

const DEST = {
  account_name:   'anavoroom',
  account_number: '01724037',
  sort_code:      '40-31-30',
};

function genRef(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0,O,I,1)
  const bytes = crypto.randomBytes(6);
  let rand = '';
  for (const b of bytes) rand += chars[b % chars.length];
  return `${prefix}-${new Date().getFullYear()}-${rand}`;
}

// POST /api/payment/initiate
// Creates pending ticket + payment records, returns bank transfer details
router.post('/initiate', (req, res) => {
  const { event_id, buyer_name, buyer_email, buyer_phone, quantity } = req.body;

  if (!event_id || !buyer_name || !buyer_email || !quantity) {
    return res.status(400).json({ error: 'event_id, buyer_name, buyer_email and quantity are required' });
  }
  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ? AND is_active = 1').get(event_id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const available = event.capacity - event.tickets_sold;
  if (quantity > available) {
    return res.status(400).json({ error: `Only ${available} ticket${available === 1 ? '' : 's'} remaining` });
  }

  const ticketRef  = genRef('AVR');
  const paymentRef = genRef('PAY');
  const amount     = +(event.price * quantity).toFixed(2);

  db.transaction(() => {
    db.prepare(`
      INSERT INTO tickets
        (reference, event_id, buyer_name, buyer_email, buyer_phone, quantity, unit_price, amount, status, payment_ref)
      VALUES (?,?,?,?,?,?,?,?,'pending',?)
    `).run(ticketRef, event_id, buyer_name.trim(), buyer_email.trim().toLowerCase(),
           buyer_phone?.trim() || null, quantity, event.price, amount, paymentRef);

    db.prepare(`
      INSERT INTO payments (payment_ref, ticket_ref, amount, status)
      VALUES (?, ?, ?, 'pending')
    `).run(paymentRef, ticketRef, amount);
  })();

  res.json({
    payment_ref:  paymentRef,
    ticket_ref:   ticketRef,
    amount,
    currency:     'GBP',
    event: {
      id:    event.id,
      title: event.title,
      date:  event.date,
      time:  event.time,
    },
    buyer: { name: buyer_name, email: buyer_email, quantity },
    bank_details: {
      ...DEST,
      payment_reference: ticketRef,
      note: 'Use your ticket reference as the bank transfer reference',
    },
    // In production: replace this with a redirect_url from your Open Banking provider
    _note: 'DUMMY API — in production this would initiate an Open Banking payment via your bank\'s API',
  });
});

// POST /api/payment/confirm
// Dummy: simulates bank confirming receipt of funds, confirms the ticket
router.post('/confirm', (req, res) => {
  const { payment_ref, payer_name, payer_sort_code, payer_account } = req.body;

  if (!payment_ref) return res.status(400).json({ error: 'payment_ref required' });

  const payment = db.prepare('SELECT * FROM payments WHERE payment_ref = ?').get(payment_ref);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (payment.status === 'confirmed') {
    // Idempotent — return the existing ticket
    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date as event_date,
             e.time as event_time, e.venue as event_venue, e.city as event_city
      FROM tickets t JOIN events e ON t.event_id = e.id
      WHERE t.reference = ?
    `).get(payment.ticket_ref);
    return res.json({ success: true, ticket_ref: payment.ticket_ref, ticket });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE reference = ?').get(payment.ticket_ref);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      UPDATE payments
      SET status = 'confirmed', payer_name = ?, payer_sort_code = ?, payer_account = ?, confirmed_at = ?
      WHERE payment_ref = ?
    `).run(payer_name?.trim() || null, payer_sort_code?.trim() || null,
           payer_account?.trim() || null, now, payment_ref);

    db.prepare(`
      UPDATE tickets SET status = 'confirmed', confirmed_at = ?
      WHERE reference = ?
    `).run(now, ticket.reference);

    db.prepare(`
      UPDATE events SET tickets_sold = tickets_sold + ?
      WHERE id = ?
    `).run(ticket.quantity, ticket.event_id);
  })();

  const full = db.prepare(`
    SELECT t.*, e.title as event_title, e.date as event_date,
           e.time as event_time, e.venue as event_venue, e.city as event_city
    FROM tickets t JOIN events e ON t.event_id = e.id
    WHERE t.reference = ?
  `).get(ticket.reference);

  res.json({
    success: true,
    ticket_ref: ticket.reference,
    ticket: full,
    _note: 'DUMMY API — payment confirmed without real bank verification',
  });
});

module.exports = router;
