# USPC Manchester — Project Reference

## What This Is
A static HTML/CSS/JS website for **United Shalom Pentecostal Church Manchester (USPC Manchester)**.
Hosted on **Netlify**, source on **GitHub** (`Amal485/uspcmcrweb`). No frameworks, no build tools.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Pages | HTML5 — 7 pages |
| Styles | CSS3 — single stylesheet, CSS custom properties |
| Scripts | Vanilla JS — `js/main.js` |
| Fonts | Google Fonts — Playfair Display (headings) + Poppins (body) |
| Calendar | Google Calendar API v3 (home page live event cards) |
| Calendar embed | Google Calendar iframe (events page — full calendar view) |
| YouTube | YouTube Data API v3 (Watch page, gallery videos, home live widget) |
| Maps | Google Maps embed (contact page — no API key needed) |
| Hosting | Netlify (auto-deploys from GitHub on push) |
| Source | GitHub — `https://github.com/Amal485/uspcmcrweb` |

## File Structure
```
uspcmcrweb/
├── index.html          # Home — hero, about, services, ministries, live widget, events, gallery preview
├── about.html          # History, vision/mission, leadership, what we believe
├── ministries.html     # Worship, Youth & Children, Women's, Men's, Outreach
├── events.html         # Google Calendar iframe embed + weekly services info strip
├── gallery.html        # Photo grid + live YouTube video section (latest 3 uploads)
├── watch.html          # Watch page — live stream, latest videos grid, playlists
├── contact.html        # Contact form, prayer request form, Google Maps, FAQ
├── css/
│   └── styles.css      # All styles — variables, layout, components, responsive
├── js/
│   └── main.js         # Nav, mobile menu, scroll reveal, forms, Google Calendar,
│                       #   YouTube API (live widget, video grid, playlists)
├── images/             # (empty — reserved for hero photos, logo local copy)
├── pictures/
│   └── leadership/     # Leadership portrait photos
│       ├── Aidapi.jpeg       → Senior Pastor
│       ├── Joshi.jpeg        → Associate Pastor
│       ├── Joel Toni.jpeg    → Youth Pastor
│       └── SWagon.jpeg       → Worship Leader
├── PROJECT.md          # This file — codebase reference
├── UPDATES.txt         # Update log and roadmap
└── .gitignore          # Excludes: .DS_Store, info.txt, UPDATES.txt, .claude/
```

## Design System
All colours are CSS variables in `:root` inside `css/styles.css`:

| Variable     | Value     | Usage |
|-------------|-----------|-------|
| `--navy`    | `#0d1b2a` | Hero, nav, dark sections |
| `--purple`  | `#3b006e` | Accent backgrounds, scripture banner |
| `--gold`    | `#c9a227` | Highlights, CTAs, borders |
| `--gold-lt` | `#e8c653` | Gold hover states |
| `--white`   | `#ffffff` | Content section backgrounds |
| `--offwhite`| `#f7f7f7` | Alternating section backgrounds |
| `--gray`    | `#6b7280` | Body text, meta labels |
| `--dark`    | `#111827` | Footer background |

Design reference: [Liverpool One Church](https://www.liverpoolonechurch.com/)

## Church Details
| Field | Value |
|-------|-------|
| Name | United Shalom Pentecostal Church Manchester |
| Address | 89 Floatshall Rd, Wythenshawe, Manchester M23 1JB |
| Email | unitedshalomchurch@gmail.com |
| YouTube | https://www.youtube.com/@USPC_MCR |
| Facebook | https://www.facebook.com/profile.php?id=100090783063581 |
| Instagram | https://www.instagram.com/uspc_manchester |
| Linktree | https://linktr.ee/unitedshalompentecostalchurch |
| Sister church | https://uspcliverpool.com (same logo used) |

## Service Times
| Service | Day | Time |
|---------|-----|------|
| Sunday School | Every Sunday | 9:30 – 10:00 AM |
| English Service | Every Sunday | 10:15 – 11:15 AM |
| Malayalam Service | Every Sunday | 11:15 AM – 1:15 PM |
| All-Night Prayer | Monthly | 10:00 PM – Dawn |

## API Keys & External Services

### Google API Key
`AIzaSyB0Ih441qc5696rs_ANj_OuY4lsc0H8ZV8`
- Stored in `js/main.js` (client-side, read-only access only)
- Restricted to: **Google Calendar API v3** + **YouTube Data API v3**
- Managed at: console.cloud.google.com → project "USPC Website" → APIs & Services → Credentials

### Google Calendar
| | |
|-|-|
| Church email calendar | `unitedshalomchurch@gmail.com` |
| Group calendar ID | `k7dl1baho552adrqj6a2f853ic@group.calendar.google.com` |
| Used on | Home page (API — live event cards), Events page (iframe embed) |

> **Important:** Both calendars must be set to **public** in Google Calendar settings:
> Settings → [Calendar] → Access permissions → "Make available to public"

### YouTube Data API v3
| | |
|-|-|
| Channel handle | `@USPC_MCR` |
| Used on | Watch page (live stream, videos, playlists), Gallery (latest 3 videos), Home (live widget) |

**Quota usage per page visit:**
| Call | Units |
|------|-------|
| Channel ID lookup (cached in sessionStorage) | 1 |
| Uploads playlist ID (cached in sessionStorage) | 1 |
| Latest videos via `playlistItems` | 1 |
| Playlists list | 1 |
| Live stream check via `search` | 100 |

Total per cold visit: ~104 units. Repeat visits in same session: ~100 (live check only).
Free daily quota: **10,000 units** (~96 cold visits/day before live-check quota runs out).

> If the live stream check is removed, quota drops to ~4 units per visit (~2,500 visits/day).

## Google Calendar — Events on Home Page
The home page events section fetches the next 3 upcoming events live from the Google Calendar API.
To update what appears: add or edit events in Google Calendar — the website updates automatically.

## YouTube — Watch Page & Gallery
- **Watch page** (`watch.html`): checks for an active live stream, shows latest 6 videos and all playlists
- **Home page**: shows a "Live Now" banner with embedded player only when the channel is broadcasting
- **Gallery page**: shows the 3 most recent YouTube uploads with click-to-play inline

To update videos/playlists: upload to YouTube — the website pulls them automatically.

## Leadership Section
Cards are rendered in `#leadership` on `about.html`. Photos live in `pictures/leadership/`.
To add or change a leader: update the HTML cards and add a photo to the folder.

## Navigation
Current nav order: **Home → About Us → Ministries → Events → Gallery → Watch → Contact**
All 7 pages share identical nav and footer HTML (manually duplicated — see shared footer note below).

## Shared Footer
Every page has an identical footer: logo, quick links, service times, address, email.
When updating any detail, update **all 7 HTML files**.

> Future improvement: JS include or static site generator (11ty, Astro) to share partials.

## Responsive Breakpoints
| Breakpoint | Behaviour |
|-----------|-----------|
| `≤ 1100px` | Hamburger nav, mobile drawer |
| `≤ 1024px` | Single-column about/contact grids |
| `≤ 640px` | Single-column everything, stacked buttons |

## Forms
Both forms (`#contact-form`, `#prayer-form`) submit to **Netlify Forms** via AJAX (no page reload).

| Attribute added | Purpose |
|----------------|---------|
| `data-netlify="true"` | Tells Netlify to capture this form |
| `name="contact"` / `name="prayer"` | Unique form identifier in Netlify dashboard |
| `<input type="hidden" name="form-name" value="…">` | Required for AJAX submissions |

Submissions appear in **Netlify dashboard → Forms**. To receive them by email:
1. Netlify dashboard → Site → Forms → `contact` → **Enable email notifications**
2. Enter `unitedshalomchurch@gmail.com`
3. Repeat for the `prayer` form

When running locally (`file://` or `localhost`) the success state is simulated — real POSTs only happen on the deployed Netlify site.

## Deployment
| | |
|-|-|
| GitHub repo | https://github.com/Amal485/uspcmcrweb |
| Hosting | Netlify (free tier) — auto-deploys on every push to `main` |
| Domain | Pending — register and point DNS to Netlify nameservers |

When the domain is live, replace the Liverpool logo CDN URL with a local copy at `images/logo.png`.
