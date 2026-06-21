# USPC Manchester — Project Context

## What This Is
A static HTML/CSS/JS website for **United Shalom Pentecostal Church Manchester (USPC Manchester)**.
Built locally, pending domain registration. No frameworks, no build tools — just plain files.

## Tech Stack
- **HTML5** — 6 pages (index, about, ministries, events, gallery, contact)
- **CSS3** — single stylesheet at `css/styles.css` using CSS custom properties (variables)
- **Vanilla JS** — `js/main.js` handles sticky nav, mobile menu, scroll-reveal animations, form feedback
- **Google Fonts** — Playfair Display (headings) + Poppins (body)
- **Google Maps embed** — contact page, no API key needed
- **Google Calendar embed** — events page, pulls from `unitedshalomchurch@gmail.com`

## File Structure
```
uspcmcrweb/
├── index.html          # Homepage — hero, about, services, ministries, events, gallery preview
├── about.html          # History, vision/mission, leadership, what we believe
├── ministries.html     # Worship, Youth & Children, Women's, Men's, Outreach
├── events.html         # Google Calendar embed + weekly services info strip
├── gallery.html        # Photo grid (placeholders) + video section
├── contact.html        # Contact form, prayer request form, Google Maps, FAQ
├── css/
│   └── styles.css      # All styles — variables, layout, components, responsive
├── js/
│   └── main.js         # Nav scroll, hamburger menu, scroll reveal, form handlers
├── images/             # (empty — for future general site images/hero photos)
├── pictures/
│   └── leadership/     # Leadership portrait photos
│       ├── Aidapi.jpeg       → Senior Pastor
│       ├── Joshi.jpeg        → Associate Pastor
│       ├── Joel Toni.jpeg    → Youth Pastor
│       └── SWagon.jpeg       → Worship Leader
└── info.txt            # Source of truth for church details (social links, address, etc.)
```

## Design System
All colours are defined as CSS variables in `:root` inside `css/styles.css`:

| Variable     | Value     | Usage                          |
|-------------|-----------|--------------------------------|
| `--navy`    | `#0d1b2a` | Hero, nav, dark sections, cards |
| `--purple`  | `#3b006e` | Accent backgrounds, scripture banner |
| `--gold`    | `#c9a227` | All highlights, CTAs, borders  |
| `--gold-lt` | `#e8c653` | Gold hover states              |
| `--white`   | `#ffffff` | Content section backgrounds    |
| `--offwhite`| `#f7f7f7` | Alternating section backgrounds |
| `--gray`    | `#6b7280` | Body text                      |
| `--dark`    | `#111827` | Footer background              |

Design inspiration: [Liverpool One Church](https://www.liverpoolonechurch.com/) — bold uppercase labels, alternating image/text layouts, dark dramatic hero.

## Church Details (from info.txt)
- **Name:** United Shalom Pentecostal Church Manchester
- **Address:** 89 Floatshall Rd, Wythenshawe, Manchester M23 1JB
- **Email:** unitedshalomchurch@gmail.com
- **Facebook:** https://www.facebook.com/profile.php?id=100090783063581
- **YouTube:** https://www.youtube.com/@USPC_MCR
- **Instagram:** https://www.instagram.com/uspc_manchester
- **Linktree:** https://linktr.ee/unitedshalompentecostalchurch
- **Sister church (Liverpool):** https://uspcliverpool.com — same logo is used

## Service Times
| Service            | Day        | Time              |
|-------------------|------------|-------------------|
| Sunday School      | Every Sunday | 9:30 – 10:00 AM  |
| English Service    | Every Sunday | 10:15 – 11:15 AM |
| Malayalam Service  | Every Sunday | 11:15 AM – 1:15 PM |
| All-Night Prayer   | Monthly    | 10:00 PM – Dawn  |

## Logo
Pulled directly from the Liverpool church CDN — same logo used for Manchester:
`https://uspcliverpool.com/wp-content/uploads/2024/11/cropped-cropped-Untitled-1-179x179.png`

When the Manchester domain is live, replace this with a locally hosted copy.

## Events System
The events page embeds a **public Google Calendar** from `unitedshalomchurch@gmail.com`.

> **Important:** The calendar must be set to public in Google Calendar settings:
> Settings → [Calendar name] → Access permissions → tick "Make available to public"

Once public, any event added to that Google Calendar will automatically appear on the website.

## Leadership Section (about.html)
Cards are rendered in the `#leadership` section on `about.html`.
Photos live in `pictures/leadership/` and are referenced by filename.
To add or change a leader: update the HTML cards in `about.html` (search for `leadership-grid`).

## Shared Footer
Every page has an identical footer with: logo, quick links, service times, address, email.
When updating contact details, update **all 6 HTML files** — the footer is duplicated across each page.
(Future improvement: use a JS include or server-side templating to share the footer.)

## Responsive Breakpoints (in styles.css)
| Breakpoint | Behaviour |
|-----------|-----------|
| `≤ 900px` | Hamburger nav, mobile drawer |
| `≤ 1024px` | Single-column about/contact grids |
| `≤ 640px` | Single-column everything, stacked buttons |

## Forms
Both the contact form and prayer request form are purely front-end (no backend).
They show a green success state for 3.5 seconds then reset. To actually receive submissions,
wire them up to a service like **Formspree**, **EmailJS**, or **Netlify Forms**.

## Deployment Plan
Currently local only. To go live:
1. Register a domain (e.g. `uspcmanchester.com` or `.org`)
2. Host on **Netlify** (free tier, drag-and-drop the folder) or **GitHub Pages**
3. Replace the Liverpool logo CDN URL with a local `/images/logo.png`
4. Set Google Calendar to public
