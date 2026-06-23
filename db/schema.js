const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data', 'tickets.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    title            TEXT    NOT NULL,
    slug             TEXT    UNIQUE NOT NULL,
    date             TEXT    NOT NULL,
    time             TEXT    DEFAULT 'Doors TBC',
    venue            TEXT    NOT NULL,
    city             TEXT    NOT NULL DEFAULT 'Manchester',
    description      TEXT,
    long_description TEXT,
    price            REAL    NOT NULL DEFAULT 0,
    capacity         INTEGER NOT NULL DEFAULT 500,
    tickets_sold     INTEGER DEFAULT 0,
    image_color      TEXT    DEFAULT '#FF8050',
    is_active        INTEGER DEFAULT 1,
    created_at       TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    reference    TEXT    UNIQUE NOT NULL,
    event_id     INTEGER NOT NULL REFERENCES events(id),
    buyer_name   TEXT    NOT NULL,
    buyer_email  TEXT    NOT NULL,
    buyer_phone  TEXT,
    quantity     INTEGER NOT NULL DEFAULT 1,
    unit_price   REAL    NOT NULL,
    amount       REAL    NOT NULL,
    status       TEXT    DEFAULT 'pending',
    payment_ref  TEXT,
    created_at   TEXT    DEFAULT (datetime('now')),
    confirmed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_ref     TEXT    UNIQUE NOT NULL,
    ticket_ref      TEXT    REFERENCES tickets(reference),
    amount          REAL    NOT NULL,
    currency        TEXT    DEFAULT 'GBP',
    status          TEXT    DEFAULT 'pending',
    payer_name      TEXT,
    payer_sort_code TEXT,
    payer_account   TEXT,
    created_at      TEXT    DEFAULT (datetime('now')),
    confirmed_at    TEXT
  );
`);

// ── Seed data ─────────────────────────────────────────────────────────────────

const seed = db.prepare('SELECT id FROM events WHERE slug = ?');

if (!seed.get('anavoroom-live-sep-2026')) {
  db.prepare(`
    INSERT INTO events
      (title, slug, date, time, venue, city, description, long_description, price, capacity, image_color)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    'anavoroom Live',
    'anavoroom-live-sep-2026',
    '2026-09-05',
    'Doors 6:00 PM',
    'Manchester — address shared on booking',
    'Manchester',
    'An evening of worship, prayer, and encounter.',
    `Join us for anavoroom Live — a powerful evening of anointed worship, prayer, and encounter with the presence of God. Whether you've been walking with God for years or you are just beginning your journey, you are welcome here.\n\nExpect: Live worship led by SWagon · Powerful preaching · Prayer and ministry time\n\nVenue is in the Manchester M22 area. The full address is shared with everyone who books a ticket.`,
    5.00,
    500,
    '#FF8050'
  );
}

module.exports = db;
