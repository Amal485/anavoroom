const express = require('express');
const router  = express.Router();
const db      = require('../db/schema');

// GET /api/tickets/:reference  — look up a single ticket (used by confirmation page)
router.get('/:reference', (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*,
           e.title  AS event_title,
           e.date   AS event_date,
           e.time   AS event_time,
           e.venue  AS event_venue,
           e.city   AS event_city,
           e.price  AS event_price
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    WHERE t.reference = ?
  `).get(req.params.reference.toUpperCase());

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
});

// GET /api/tickets  — admin: all tickets (add auth middleware in production)
router.get('/', (req, res) => {
  const { event_id, status } = req.query;
  let sql = `
    SELECT t.*, e.title AS event_title, e.date AS event_date
    FROM tickets t JOIN events e ON t.event_id = e.id
    WHERE 1=1
  `;
  const params = [];
  if (event_id) { sql += ' AND t.event_id = ?'; params.push(event_id); }
  if (status)   { sql += ' AND t.status = ?';   params.push(status); }
  sql += ' ORDER BY t.created_at DESC';

  const tickets = db.prepare(sql).all(...params);
  const summary = db.prepare(`
    SELECT event_id, e.title, COUNT(*) AS orders, SUM(quantity) AS total_tickets, SUM(amount) AS revenue
    FROM tickets t JOIN events e ON t.event_id = e.id
    WHERE t.status = 'confirmed'
    GROUP BY event_id
  `).all();

  res.json({ tickets, total: tickets.length, summary });
});

module.exports = router;
