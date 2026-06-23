const express = require('express');
const router  = express.Router();
const db      = require('../db/schema');

// GET /api/events
router.get('/', (req, res) => {
  const events = db.prepare(`
    SELECT *, (capacity - tickets_sold) AS available
    FROM events WHERE is_active = 1
    ORDER BY date ASC
  `).all();
  res.json({ events });
});

// GET /api/events/:slug
router.get('/:slug', (req, res) => {
  const event = db.prepare(`
    SELECT *, (capacity - tickets_sold) AS available
    FROM events WHERE slug = ? AND is_active = 1
  `).get(req.params.slug);

  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ event });
});

module.exports = router;
