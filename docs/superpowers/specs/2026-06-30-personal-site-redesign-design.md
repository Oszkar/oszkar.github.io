# Personal Site Redesign & Stack Modernization — Design

**Date:** 2026-06-30
**Owner:** Oszkar Jozsa
**Site:** https://oszkar.me (GitHub Pages, custom domain)

## 1. Goal

Modernize and clean up the personal site to build a stronger personal brand, while
keeping it **simple and easy to maintain**. Concretely:

- Strip the abandoned, bloated stack (Bootstrap 4, jQuery, three icon-font libraries,
  dead build pipeline) down to lean, hand-maintained **vanilla static HTML + CSS**.
- Adopt the approved **warm editorial** visual direction (the Claude Design export the
  user produced), rebuilt as clean source rather than shipped as a 3 MB JS bundle.
- Structure the site so it can **grow later** (a blog/writing section, a projects page)
  without a rewrite.
- Preserve the site's existing strengths: strong SEO metadata, OpenGraph/Twitter cards,
  `schema.org` Person structured data, canonical URL, custom domain.

## 2. Chosen direction

**Warm editorial**, matching `mockups/Oszkar Jozsa - standalone.html`:

- **Canvas:** warm cream `#f1e8d8`
- **Accent:** terracotta `#bc6a43`
- **Ink:** near-black headings, warm grey body text; muted sand `#cbb695` for secondary
- **Type:** Hanken Grotesk (headings 700–800, body 400–500)
- **Feel:** calm, confident, typography-led, single readable column with a hero photo.

This was the user's own design output and aligns with the recommended "Direction A."
The three exploratory mockups (`direction-a/b/c`) and the bundle are **reference only**
and will be removed from the repo before launch (not committed / deleted).

## 3. Why rebuild instead of shipping the export

The Claude Design export is a **3 MB "bundled page"**: a JS loader that gzip-unpacks the
DOM at runtime. Shipping it as-is would conflict with every goal:

| Problem | Impact |
|---|---|
| 3 MB payload (~200× the ~15 KB this needs as plain HTML/CSS) | Slow, wasteful |
| Renders nothing without JS | Crawlers / link previews / no-JS users see a blank page — destroys the existing SEO investment |
| One opaque compressed artifact | Not editable; opposite of "simple to maintain" |

**Plan:** extract the real markup/CSS from the bundle and rebuild it as clean, readable
static source so the look is faithful but the output is lean, crawlable, and editable.

## 4. Information architecture

Single page (`index.html`), sections in order:

1. **Hero** — name, location eyebrow, headline ("Technology leader & engineer. I automate
   things."), short bio, photo, primary CTA (Get in touch) + GitHub / LinkedIn links,
   and a **"Now" status pill** (current role one-liner).
2. **Experience** — click-to-expand rows. Woven by Toyota, Rapyuta Robotics, Ascent
   Robotics, and a grouped "ZMP · Cognex · earlier" row. First row expanded by default.
3. **Selected Projects** — 2–4 cards (title, one-line outcome, role, optional link/image).
   *Content to be provided by the user.* Section is omitted gracefully if empty.
4. **Education** — compact: institution, degree, years (Georgia Tech, BME, Florida Tech;
   AIT optional). Condensed vs. the current verbose version.
5. **Off the clock** — interests blurb + photo gallery (motorcycles, travel).
6. **Footer CTA** — dark "Let's build something" block with `mailto:mail@oszkar.me` and
   GitHub / LinkedIn links. **No contact form** (web3forms dependency removed).

Removed from the current site: `Full CV` link, the web3forms contact form and its
success section, the `#interests` verbose copy (condensed into "Off the clock").

## 5. Component / file structure

```
index.html                 # the whole page, semantic HTML
css/style.css              # one modern stylesheet (custom properties, no framework)
js/main.js                 # ~30 lines: expand rows, smooth scroll, scrollspy (IntersectionObserver)
img/                       # optimized images (see §7)
fonts/                     # (optional) self-hosted Hanken Grotesk woff2
/CNAME, /favicon*, /apple-touch-icon.png   # unchanged
```

**Room to grow (no rewrite needed later):**
- A future blog lives at `/writing/` (an `index.html` listing + `/writing/<post>.html`),
  reusing `css/style.css`. A "Writing" nav link can be added then with no restructuring.
- A projects detail page can live at `/projects/` the same way.
- If volume ever justifies it, the static structure ports cleanly to a generator
  (Astro/Eleventy) — but that is explicitly **out of scope** now.

## 6. Stack changes

**Remove entirely:**
- `vendor/` (Bootstrap, jQuery, jQuery-Easing, Font Awesome, devicons, simple-line-icons) — ~6.4 MB
- The stale `scss/` pipeline (out of sync with shipped CSS) and `css/resume.css`
- `js/resume.js` / `js/resume.min.js` (jQuery-based)
- Dead Universal Analytics tag `UA-70086439-2` (Google shut UA off in July 2023 — collects nothing)

**Add:**
- Inline **SVG** icons for GitHub / LinkedIn (no icon fonts)
- One small vanilla `js/main.js` (expand interaction + smooth scroll + active-nav via
  `IntersectionObserver`); the site is fully functional/readable without it
- Hanken Grotesk via Google Fonts (`preconnect` + `display=swap`), **or** self-hosted
  woff2 in `/fonts` for zero third-party calls (recommended for privacy/perf — decided at build)

**Analytics (recommendation, not yet decided):** remove the dead UA tag. Optionally add a
lightweight, cookieless analytics later (e.g. Cloudflare Web Analytics — one script tag,
no cookies, GDPR-friendly). Default if undecided: ship with **no analytics**.

## 7. Performance & quality budget

- Total page weight target: **< 300 KB** on first load (excluding gallery images, which
  lazy-load). HTML/CSS/JS combined ~20–30 KB.
- Optimize images: re-encode the gallery and profile photos (the current `bike4.jpg` is
  970 KB, `profile2a_small.png` is a 446 KB PNG of a photo). Convert photos to WebP/optimized
  JPEG, add explicit `width`/`height` and `loading="lazy"`. Target each image < 150 KB.
- Accessibility: semantic landmarks, alt text on all images, visible focus styles,
  keyboard-operable expand rows (`<button>`/`<details>`), color contrast AA.
- Preserve & update all SEO metadata; update `<title>` from "Resume — Oszkar Jozsa" to a
  brand-style title; fix the OG/Twitter image to an optimized asset.
- Responsive: mobile-first; gallery and hero reflow on small screens.

## 8. Content fixes (carried from review)

- `<title>`: "Resume — Oszkar Jozsa" → e.g. "Oszkar Jozsa — Technology Leader & Engineer"
- Contact copy currently says "we'll get back to you" (corporate "we" on a personal site)
  → first person "I".
- Keep structured data (`schema.org/Person`) and refresh `jobTitle`/`worksFor` if needed.

## 9. Out of scope (YAGNI)

- No framework / SSG, no build step, no CSS framework, no JS bundler.
- No blog posts yet — only the structure that lets them be added later.
- No CMS, no dark-mode toggle (the warm light theme is the identity), no i18n.
- The contact form is intentionally removed in favor of `mailto:`.

## 10. Open items (need user input before/within implementation)

1. **Projects content** — 2–4 projects (title, outcome, role, optional link/image).
2. **Analytics** — none (default) vs. add cookieless analytics.
3. **Font hosting** — Google Fonts link (simplest) vs. self-hosted woff2 (recommended).

## 11. Acceptance criteria

- [ ] `index.html` renders the full warm-editorial design with **no** Bootstrap/jQuery/icon-fonts.
- [ ] `vendor/`, `scss/`, old `css`/`js`, and the dead UA tag are removed.
- [ ] Page is fully readable/crawlable with JavaScript disabled.
- [ ] All SEO/OG/Twitter/structured-data metadata preserved and updated; `<title>` rebranded.
- [ ] Experience rows expand/collapse; works by keyboard; first row open by default.
- [ ] Education (compact) and Off-the-clock gallery present; Projects present if content provided.
- [ ] Footer uses `mailto:`; no web3forms form remains.
- [ ] Images optimized (< ~150 KB each), lazy-loaded, with `width`/`height` and alt text.
- [ ] Total first-load weight < 300 KB; verified rendering at mobile + desktop widths.
- [ ] Throwaway `mockups/` removed from the repo before launch.
```
