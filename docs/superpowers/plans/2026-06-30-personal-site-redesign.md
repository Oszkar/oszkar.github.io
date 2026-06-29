# Personal Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild oszkar.me as a lean, hand-maintained static site in the approved warm-editorial design, dropping Bootstrap/jQuery/icon-fonts and the dead analytics tag while preserving (and improving) SEO.

**Architecture:** One `index.html` (semantic HTML, all content), one `css/style.css` (CSS custom properties, no framework), one tiny `js/main.js` (progressive enhancement only — the page is fully functional without it). Native `<details>` powers the expandable experience rows so they work with JS disabled. Icons are inline SVG. Hosted unchanged on GitHub Pages with the existing custom domain.

**Tech Stack:** Vanilla HTML5 + CSS3 (custom properties, grid/flex), minimal vanilla JS (IntersectionObserver), Hanken Grotesk via Google Fonts, Cloudflare Web Analytics beacon.

**Reference:** Approved design = `mockups/Oszkar Jozsa - standalone.html` (a 3 MB Claude Design bundle — used as the *visual* ground truth only, never shipped). Spec: `docs/superpowers/specs/2026-06-30-personal-site-redesign-design.md`.

**Pending user inputs (do NOT block the build):**
- Projects content (2–4) → Task 4 ships the section commented-out until provided.
- Cloudflare beacon token → Task 1 uses placeholder `CF_TOKEN_PLACEHOLDER`.

**Verification note:** This is a static site with no unit-testable logic. "Tests" here are render checks (screenshots at mobile + desktop via a local server), no-JS rendering checks, structural greps, and a page-weight budget. The plan uses those as the verify gates.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `index.html` | Entire page: head/SEO, nav, all sections | Replace |
| `css/style.css` | Design tokens + all styles | Create |
| `js/main.js` | Smooth scroll + active-nav (IntersectionObserver) | Create |
| `img/*` | Optimized photos | Re-encode |
| `css/resume.css`, `scss/`, `js/resume*.js`, `vendor/` | Legacy stack | Delete |
| `mockups/` | Throwaway design refs | Delete at end |
| `README.md` | Project description | Update |
| `CNAME`, `favicon*`, `apple-touch-icon.png` | Domain + icons | Keep as-is |

All work happens on the existing `site-redesign` branch.

---

### Task 1: Scaffold — extract design reference, build `<head>` + CSS tokens + page skeleton

**Goal:** Stand up the new `index.html` (full `<head>`, nav, empty section landmarks) and `css/style.css` (design tokens + reset + base + nav), using the bundle as visual ground truth.

**Files:**
- Create: `index.html` (replaces old)
- Create: `css/style.css`
- Create (reference, gitignored/temp): `mockups/_extracted.html` — cleaned dump of the bundle

**Acceptance Criteria:**
- [ ] `index.html` head preserves all existing SEO/OG/Twitter/`schema.org` metadata, with `<title>` rebranded and the dead `UA-` script removed.
- [ ] Google Fonts (Hanken Grotesk) and the Cloudflare beacon (placeholder token) are linked.
- [ ] `css/style.css` defines the warm-editorial tokens in `:root` and a CSS reset + base typography + sticky nav.
- [ ] Page loads on the local server with no console errors; nav is visible; background is cream `#f1e8d8`.

**Verify:** `python -m http.server 8765` then load `http://localhost:8765/` → cream page, nav bar, branded title in tab; DevTools console clean.

**Steps:**

- [ ] **Step 1: Capture the design ground truth from the bundle.** Start the server and render the bundle, then dump the unpacked DOM+CSS (stripping the multi-MB `data:` image URIs) to `mockups/_extracted.html` for reference while building. Run in the browser console (or via Playwright `browser_evaluate`) on `http://localhost:8765/mockups/Oszkar%20Jozsa%20-%20standalone.html` after it finishes "Unpacking…":

```js
// returns cleaned HTML+CSS string; save it to mockups/_extracted.html
const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r=>r.cssText).join('\n') } catch(e){ return '' } }).join('\n');
const html = document.body.innerHTML.replace(/data:[^"')]+/g, 'data:STRIPPED');
`<!-- EXTRACTED REFERENCE -->\n<style>\n${css}\n</style>\n${html}`;
```

This is the exact spacing/markup reference. Transcribe from it in Tasks 2–5 (do NOT ship it).

- [ ] **Step 2: Write `css/style.css` tokens + base.** Exact values (fine-tune against `_extracted.html`):

```css
:root{
  --bg:#f1e8d8; --surface:#f7f1e6; --dark:#2a2420;
  --ink:#2a2521; --body:#5c5448; --muted:#8a7f6e;
  --accent:#bc6a43; --accent-ink:#a4542f; --sand:#cbb695; --line:#e0d4bd;
  --max:1040px; --gap:clamp(1rem,4vw,2.5rem);
  --font:"Hanken Grotesk",system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--body);font-family:var(--font);
  font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
h1,h2,h3{color:var(--ink);font-weight:800;line-height:1.05;letter-spacing:-.01em}
a{color:var(--accent-ink);text-decoration:none}
a:hover{text-decoration:underline;text-underline-offset:3px}
.eyebrow{font-size:13px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent);font-weight:700}
/* sticky nav */
.nav{position:sticky;top:0;z-index:20;background:rgba(241,232,216,.85);
  backdrop-filter:saturate(160%) blur(8px);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:62px}
.nav .brand{font-weight:800;color:var(--ink);font-size:18px}
.nav ul{display:flex;gap:26px;list-style:none;font-size:15px}
.nav a{color:var(--body);font-weight:600}
.nav a:hover,.nav a.active{color:var(--accent-ink);text-decoration:none}
@media(max-width:640px){.nav ul{display:none}}
section{padding:clamp(2.5rem,7vw,5rem) 0;border-top:1px solid var(--line)}
.section-label{font-size:13px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent);font-weight:700;margin-bottom:28px}
```

- [ ] **Step 3: Write `index.html` head + skeleton.** Preserve the current metadata block (from the old file) with these changes: drop the `gtag`/`UA-` script entirely; change `<title>` to `Oszkar Jozsa — Technology Leader & Engineer`; swap stylesheet to `css/style.css`; add fonts + beacon. Body is nav + empty `<section>` landmarks filled in later.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Oszkar Jozsa — Technology Leader &amp; Engineer</title>
  <meta name="author" content="Oszkar Jozsa">
  <meta name="description" content="Engineer, product leader, robotics enthusiast, tech nerd and a general funny guy.">
  <meta name="keywords" content="autonomous driving,self driving car,robotics,engineer,japan,technical program manager,engineering manager,product manager,machine learning,mobility">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#bc6a43">
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://oszkar.me/">
  <meta property="og:title" content="Oszkar Jozsa — Technology Leader & Engineer">
  <meta property="og:description" content="Engineer, product leader, robotics enthusiast, tech nerd and a general funny guy.">
  <meta property="og:image" content="https://oszkar.me/img/profile2a_small.png">
  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Oszkar Jozsa — Technology Leader & Engineer">
  <meta name="twitter:description" content="Engineer, product leader, robotics enthusiast, tech nerd and a general funny guy.">
  <meta name="twitter:image" content="https://oszkar.me/img/profile2a_small.png">
  <link rel="canonical" href="https://oszkar.me/">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Person","name":"Oszkar Jozsa","url":"https://oszkar.me","jobTitle":"Senior Technical Program Manager","worksFor":{"@type":"Organization","name":"Woven by Toyota"},"address":{"@type":"PostalAddress","addressLocality":"Tokyo","addressCountry":"Japan"},"sameAs":["https://www.linkedin.com/in/oszkarjozsa/","https://github.com/Oszkar/"]}
  </script>
</head>
<body>
  <header class="nav"><div class="wrap">
    <span class="brand">Oszkar Jozsa</span>
    <ul>
      <li><a href="#work">Work</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </div></header>
  <main>
    <section id="hero"><!-- Task 2 --></section>
    <section id="work"><!-- Task 3 --></section>
    <section id="projects"><!-- Task 4 --></section>
    <section id="education"><!-- Task 5 --></section>
    <section id="offclock"><!-- Task 5 --></section>
  </main>
  <footer id="contact"><!-- Task 5 --></footer>
  <!-- Cloudflare Web Analytics -->
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"CF_TOKEN_PLACEHOLDER"}'></script>
  <!-- end Cloudflare -->
  <script src="js/main.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Verify.** Start `python -m http.server 8765`, open `http://localhost:8765/`, confirm cream bg, nav, branded tab title, clean console.

- [ ] **Step 5: Commit.**

```bash
git add index.html css/style.css
git commit -m "Scaffold new static site: head, design tokens, nav skeleton"
```

---

### Task 2: Hero section + "Now" status pill

**Goal:** Build the hero (eyebrow, headline, bio, photo, CTA + social SVGs, "Now" pill) matching the design.

**Files:**
- Modify: `index.html` (`#hero`)
- Modify: `css/style.css` (append hero styles)

**Acceptance Criteria:**
- [ ] Headline reads "Technology leader & engineer. I automate things." with the second sentence in the muted accent tint.
- [ ] Photo renders in a circle to the right on desktop, stacks on mobile.
- [ ] "Get in touch" button + GitHub/LinkedIn inline-SVG links present and working.
- [ ] "Now" pill shows current role one-liner.
- [ ] Renders correctly with JavaScript disabled.

**Verify:** Reload `/`; screenshot at 1280px and 390px widths; compare against `_extracted.html` hero; toggle JS off → hero unchanged.

**Steps:**

- [ ] **Step 1: Add hero markup** inside `#hero` (`<div class="wrap">…`). Concrete content:

```html
<div class="wrap hero">
  <div class="hero-text">
    <p class="eyebrow">Tokyo, Japan</p>
    <h1>Technology leader &amp; engineer. <span class="hl">I automate things.</span></h1>
    <p class="hero-bio">13+ years across startups, government and multinationals in robotics &amp; autonomous driving. I grow teams and scale products as an engineer, people manager and PM — and try to bring a little cheer along the way.</p>
    <div class="hero-cta">
      <a class="btn" href="#contact">Get in touch</a>
      <a href="https://github.com/Oszkar/">GitHub</a>
      <a href="https://www.linkedin.com/in/oszkarjozsa/">LinkedIn</a>
    </div>
  </div>
  <img class="hero-photo" src="img/profile2a_small.png" width="200" height="200" alt="Oszkar Jozsa">
</div>
<div class="wrap"><p class="now"><span class="dot"></span><b>Now</b> — Sr. Technical PM / Product at <b>Woven by Toyota</b> · Arene platform: ADAS simulation, developer tooling, big data</p></div>
```

(Use inline `<svg>` for the GitHub/LinkedIn marks instead of text if matching the bundle; copy the SVG paths from `mockups/direction-a-editorial.html` which already has clean 24×24 paths.)

- [ ] **Step 2: Append hero CSS** to `css/style.css`:

```css
.hero{display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center;padding-top:clamp(3rem,8vw,6rem)}
.hero h1{font-size:clamp(2.4rem,6vw,4rem);margin:18px 0 22px}
.hero h1 .hl{color:var(--sand)}
.hero-bio{font-size:clamp(1.05rem,2.5vw,1.25rem);max-width:38ch;color:var(--body)}
.hero-photo{width:200px;height:200px;border-radius:50%;object-fit:cover;box-shadow:0 12px 40px rgba(42,36,32,.18)}
.hero-cta{display:flex;align-items:center;gap:22px;margin-top:30px;font-weight:600}
.btn{background:var(--accent);color:#fff;padding:12px 24px;border-radius:999px;font-weight:700}
.btn:hover{background:var(--accent-ink);text-decoration:none}
.now{display:inline-flex;align-items:center;gap:10px;background:var(--surface);
  border:1px solid var(--line);border-radius:12px;padding:14px 18px;font-size:15px;color:var(--body);margin-top:18px}
.now .dot{width:8px;height:8px;border-radius:50%;background:#3f9d52;flex:none}
@media(max-width:760px){.hero{grid-template-columns:1fr}.hero-photo{width:120px;height:120px;order:-1}}
```

- [ ] **Step 3: Verify** render at desktop + mobile; JS-off check. Adjust spacing to match `_extracted.html`.

- [ ] **Step 4: Commit.**

```bash
git add index.html css/style.css
git commit -m "Add hero section with Now pill"
```

---

### Task 3: Experience section (native expandable rows)

**Goal:** Build the click-to-expand experience list using `<details>`/`<summary>` so it works without JS and is keyboard-accessible; first row open.

**Files:**
- Modify: `index.html` (`#work`)
- Modify: `css/style.css`

**Acceptance Criteria:**
- [ ] All roles present: Woven by Toyota, Rapyuta Robotics, Ascent Robotics (grouped 2017–2020), and "ZMP · Cognex · earlier" (grouped). Content from the spec/old resume.
- [ ] Rows expand/collapse on click AND via keyboard (Enter/Space on the summary).
- [ ] First row (`open` attribute) expanded by default; expand works with JS disabled.
- [ ] Each row shows title, org, years; expanded body shows bullet detail.

**Verify:** Reload; click each row; Tab to a summary and press Enter; disable JS and confirm expand still works (native `<details>`).

**Steps:**

- [ ] **Step 1: Markup** inside `#work` — pattern (repeat per role, content from old `index.html` experience entries, condensed):

```html
<div class="wrap">
  <p class="section-label">Experience</p>
  <details class="role" open>
    <summary><span class="role-title">Senior Technical Program Manager / Product Manager</span>
      <span class="role-org">Woven by Toyota</span><span class="role-when">2021 — now</span></summary>
    <ul class="role-detail">
      <li>Product on Arene, Toyota's next-generation software platform &amp; dev tooling</li>
      <li>3D simulation for ADAS testing and validation</li>
      <li>Developer tools, software automation, big-data collection &amp; visualization</li>
      <li>Own a portfolio with 2,000+ B2B users across Toyota and 3rd-party supply chain</li>
    </ul>
  </details>
  <details class="role">
    <summary><span class="role-title">Engineering Lead</span>
      <span class="role-org">Rapyuta Robotics</span><span class="role-when">2020 — 21</span></summary>
    <p class="role-detail">Led three client-facing projects ($0.2–1.5M) in warehouse &amp; construction automation — automated forklifts, from perception/ML to customizing our SaaS/PaaS cloud backend.</p>
  </details>
  <details class="role">
    <summary><span class="role-title">Engineering Manager / Technical Lead</span>
      <span class="role-org">Ascent Robotics</span><span class="role-when">2017 — 20</span></summary>
    <p class="role-detail">Joined as the 2nd engineer; grew with the company through Series A to lead the self-driving department of 30+ people, served as interim CTO, and owned architecture, hiring and roadmap. Earlier: senior robotics engineer designing the self-driving R&amp;D platform.</p>
  </details>
  <details class="role">
    <summary><span class="role-title">Software / Robotics Engineer</span>
      <span class="role-org">ZMP · Cognex · Hungarian Academy of Sciences</span><span class="role-when">2011 — 17</span></summary>
    <p class="role-detail">Self-driving platforms at ZMP; industrial vision SDKs at Cognex (products with $100M+ combined sales); 2D/3D computer vision and lidar point-cloud research at the Hungarian Academy of Sciences.</p>
  </details>
</div>
```

- [ ] **Step 2: CSS** for rows:

```css
.role{border-bottom:1px solid var(--line);padding:20px 0}
.role summary{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;cursor:pointer;list-style:none}
.role summary::-webkit-details-marker{display:none}
.role summary::after{content:"+";margin-left:auto;color:var(--accent);font-weight:700;font-size:20px}
.role[open] summary::after{content:"−"}
.role-title{font-weight:700;color:var(--ink);font-size:1.15rem}
.role-org{color:var(--accent-ink);font-weight:600}
.role-when{color:var(--muted);font-size:.95rem}
.role-detail{margin-top:14px;color:var(--body)}
ul.role-detail{padding-left:1.1rem} ul.role-detail li{margin:6px 0}
```

- [ ] **Step 3: Verify** click + keyboard + JS-off. **Step 4: Commit** `git commit -m "Add expandable experience section"`.

---

### Task 4: Projects section (ships commented-out until content provided)

**Goal:** Build the Projects markup + card styles, but keep the section commented out (so nothing placeholder-y ships) until the user supplies 2–4 real projects.

**Files:**
- Modify: `index.html` (`#projects`)
- Modify: `css/style.css`

**Acceptance Criteria:**
- [ ] A complete, styled project-card grid exists in the source as an HTML comment with a clear fill-in template.
- [ ] When uncommented and populated, cards render in a responsive grid (1/2/3 columns) matching the design.
- [ ] With the section empty/commented, the page shows no empty "Projects" gap (the `#projects` section renders nothing).

**Verify:** Temporarily uncomment with 3 sample cards → grid renders at desktop/mobile; re-comment → no visual gap remains.

**Steps:**

- [ ] **Step 1: Markup** — put the section content in a comment with a template:

```html
<!-- PROJECTS: uncomment and fill when content is provided (2–4 cards).
<div class="wrap">
  <p class="section-label">Selected Projects</p>
  <div class="projects">
    <article class="project">
      <a class="project-media" href="PROJECT_URL"><img src="img/PROJECT.jpg" alt="" loading="lazy" width="600" height="380"></a>
      <h3>PROJECT TITLE</h3>
      <p>One-line outcome · your role</p>
    </article>
  </div>
</div>
-->
```

- [ ] **Step 2: CSS**:

```css
.projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px}
.project-media{display:block;border-radius:12px;overflow:hidden;background:var(--surface);border:1px solid var(--line);aspect-ratio:3/2}
.project-media img{width:100%;height:100%;object-fit:cover;display:block}
.project h3{font-size:1.15rem;margin:14px 0 4px}
.project p{color:var(--muted);font-size:.95rem}
```

- [ ] **Step 3:** Verify the temporarily-uncommented version renders, then re-comment. **Step 4: Commit** `git commit -m "Add Projects section scaffold (awaiting content)"`.

---

### Task 5: Education (compact) + Off-the-clock gallery + footer CTA

**Goal:** Build the remaining content: a compact Education list, the interests photo gallery, and the dark "Let's build something" footer with `mailto:`.

**Files:**
- Modify: `index.html` (`#education`, `#offclock`, `footer#contact`)
- Modify: `css/style.css`

**Acceptance Criteria:**
- [ ] Education lists Georgia Tech (MSc), BME (BEng), Florida Tech (BSc) compactly — institution, degree, years.
- [ ] Off-the-clock shows the interests blurb + a responsive gallery of optimized photos with `loading="lazy"` and `width`/`height`.
- [ ] Footer is a dark block with "Let's build something.", a `mailto:mail@oszkar.me` button, GitHub/LinkedIn links, and `© <year> Oszkar Jozsa · Meguro-ku, Tokyo, Japan`.
- [ ] No web3forms form exists anywhere in the file.

**Verify:** Reload; check all three blocks at desktop/mobile; `grep -i web3forms index.html` → no matches; gallery images lazy-load.

**Steps:**

- [ ] **Step 1: Education markup** (`#education`):

```html
<div class="wrap">
  <p class="section-label">Education</p>
  <ul class="edu">
    <li><span class="edu-org">Georgia Institute of Technology</span><span class="edu-deg">MSc Computer Science — Computational Perception &amp; Robotics</span><span class="edu-when">2015 — 18</span></li>
    <li><span class="edu-org">Budapest University of Technology &amp; Economics</span><span class="edu-deg">BEng Computer Engineering — Autonomous Control Systems &amp; Robots</span><span class="edu-when">2006 — 12</span></li>
    <li><span class="edu-org">Florida Institute of Technology</span><span class="edu-deg">BSc Computer Science (EU STARS scholarship)</span><span class="edu-when">2009 — 10</span></li>
  </ul>
</div>
```

- [ ] **Step 2: Off-the-clock markup** (`#offclock`) — use the existing interest photos:

```html
<div class="wrap">
  <p class="section-label">Off the clock</p>
  <p class="offclock-intro">Motorcycles, beer brewing, home automation and photography. When I'm not working I'm usually traveling, exploring the city, or out on the bike.</p>
  <div class="gallery">
    <img src="img/bike4.jpg" alt="Motorcycle in the mountains" loading="lazy" width="600" height="400">
    <img src="img/hiroshima.jpg" alt="Hiroshima" loading="lazy" width="600" height="400">
    <img src="img/hong_kong.jpg" alt="Hong Kong at night" loading="lazy" width="600" height="400">
    <img src="img/bike3.jpg" alt="Motorcycle" loading="lazy" width="600" height="400">
  </div>
</div>
```

- [ ] **Step 3: Footer markup** (`footer#contact`):

```html
<div class="wrap footer-cta">
  <div>
    <h2>Let's build something.</h2>
    <p>For roles, consulting or just to say hi — drop me a line and I'll get back to you.</p>
  </div>
  <div class="footer-actions">
    <a class="btn btn-light" href="mailto:mail@oszkar.me">mail@oszkar.me</a>
    <div class="footer-links"><a href="https://github.com/Oszkar/">GitHub</a><a href="https://www.linkedin.com/in/oszkarjozsa/">LinkedIn</a></div>
  </div>
</div>
<p class="copyright">© 2026 Oszkar Jozsa · Meguro-ku, Tokyo, Japan</p>
```

- [ ] **Step 4: CSS** for all three:

```css
.edu{list-style:none;display:grid;gap:18px}
.edu li{display:grid;grid-template-columns:1fr auto;gap:2px 16px;padding-bottom:16px;border-bottom:1px solid var(--line)}
.edu-org{font-weight:700;color:var(--ink)} .edu-deg{color:var(--body);grid-column:1} .edu-when{color:var(--muted);grid-row:1/3;align-self:start}
.offclock-intro{max-width:60ch;margin-bottom:24px}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.gallery img{width:100%;height:240px;object-fit:cover;border-radius:10px}
footer#contact{background:var(--dark);color:#e7ddcb;border-top:none;margin-top:0}
.footer-cta{display:flex;justify-content:space-between;gap:32px;flex-wrap:wrap;align-items:center}
footer#contact h2{color:#fff;font-size:clamp(1.8rem,4vw,2.6rem)}
.footer-cta p{color:#bcae97;margin-top:8px;max-width:42ch}
.btn-light{background:#e8a87c;color:var(--dark)}
.footer-links{display:flex;gap:18px;margin-top:14px}.footer-links a{color:#e7ddcb}
.copyright{color:var(--muted);text-align:center;padding:28px 0;font-size:14px}
```

- [ ] **Step 5: Verify** render + `grep -i web3forms index.html` (expect nothing). **Step 6: Commit** `git commit -m "Add education, gallery and footer CTA"`.

---

### Task 6: JavaScript progressive enhancement (`js/main.js`)

**Goal:** Add smooth-scroll polish and active-nav highlighting via IntersectionObserver. The site must remain fully functional with this file absent.

**Files:**
- Create: `js/main.js`

**Acceptance Criteria:**
- [ ] Nav links get an `.active` class as their section scrolls into view.
- [ ] No errors in console; no dependency on jQuery or any library.
- [ ] Removing `js/main.js` leaves the site fully readable and the experience rows still expandable.

**Verify:** Scroll the page → active nav item updates; delete-test (rename main.js, reload) → page still works; console clean.

**Steps:**

- [ ] **Step 1: Write `js/main.js`:**

```js
// Progressive enhancement only — site works fully without this file.
(() => {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        const a = map.get(e.target.id);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id], footer[id]').forEach(s => io.observe(s));
})();
```

- [ ] **Step 2: Verify** active-nav on scroll + delete-test + clean console. **Step 3: Commit** `git commit -m "Add vanilla JS for active-nav highlighting"`.

---

### Task 7: Optimize images

**Goal:** Re-encode the photos used on the page so each is small, with explicit dimensions and lazy-loading already wired (Tasks 2/5). Update the OG/Twitter image if a smaller asset is produced.

**Files:**
- Modify/replace: `img/profile2a_small.png`, `img/bike4.jpg`, `img/bike3.jpg`, `img/hiroshima.jpg`, `img/hong_kong.jpg`
- Possibly modify: `index.html` (image `src`/`og:image` if filenames change)

**Acceptance Criteria:**
- [ ] Every image referenced by `index.html` is < ~150 KB.
- [ ] Profile photo is a properly sized square (not a 446 KB PNG of a photo) — re-encode to optimized JPEG/WebP.
- [ ] Page total transfer (HTML+CSS+JS+images, excluding fonts) < 300 KB on first load.

**Verify:** `ls -la img/` shows reduced sizes; load `/` in DevTools Network tab → total < 300 KB; images still crisp.

**Steps:**

- [ ] **Step 1:** Re-encode with available tooling. If ImageMagick/`cwebp` present:

```bash
# resize + compress photos (adjust to taste); keep aspect, target ~1200px max edge
magick img/bike4.jpg -resize 1200x -quality 78 img/bike4.jpg
magick img/bike3.jpg -resize 1200x -quality 78 img/bike3.jpg
magick img/hiroshima.jpg -resize 1200x -quality 78 img/hiroshima.jpg
magick img/hong_kong.jpg -resize 1200x -quality 78 img/hong_kong.jpg
# profile: square 400px, JPEG
magick img/profile2a_small.png -resize 400x400^ -gravity center -extent 400x400 -quality 85 img/profile.jpg
```

If no CLI tooling is available, note it in the commit and ask the user to run an optimizer (or defer this task) — do NOT skip silently.

- [ ] **Step 2:** If profile became `profile.jpg`, update `index.html` hero `src` and both `og:image`/`twitter:image` to `https://oszkar.me/img/profile.jpg`.

- [ ] **Step 3: Verify** sizes + network budget. **Step 4: Commit** `git commit -m "Optimize images and update OG image"`.

---

### Task 8: Remove the legacy stack + update docs + drop mockups

**Goal:** Delete everything the new site no longer needs and refresh the README. The new site already stands alone after Tasks 1–7.

**Files:**
- Delete: `vendor/`, `scss/`, `css/resume.css`, `js/resume.js`, `js/resume.min.js`, `mockups/`
- Modify: `README.md`
- Keep: `CNAME`, `favicon*`, `apple-touch-icon.png`, `LICENSE`, `.gitignore`

**Acceptance Criteria:**
- [ ] `vendor/`, `scss/`, legacy `css`/`js`, and `mockups/` are gone.
- [ ] No reference to bootstrap, jquery, font-awesome, devicons, simple-line-icons, web3forms, or `UA-` remains anywhere in the repo.
- [ ] `index.html` still renders correctly after deletions.
- [ ] README describes the new hand-built static site (no longer "Start Bootstrap").

**Verify:**
```bash
grep -riE "bootstrap|jquery|font-awesome|devicons|simple-line-icons|web3forms|UA-[0-9]" --include=*.html --include=*.css --include=*.js .
```
→ no matches. Then reload `/` → unchanged.

**Steps:**

- [ ] **Step 1: Delete** legacy dirs/files:

```bash
git rm -r vendor scss css/resume.css js/resume.js js/resume.min.js
rm -rf mockups   # untracked — plain rm
```

- [ ] **Step 2: Rewrite `README.md`** to describe a hand-built vanilla static site (purpose, structure: `index.html` + `css/style.css` + `js/main.js`, deployed via GitHub Pages on `oszkar.me`). Remove the Start Bootstrap credit/license boilerplate that no longer applies.

- [ ] **Step 3: Verify** the grep is clean and the site still renders. **Step 4: Commit** `git commit -m "Remove legacy Bootstrap/jQuery stack; update README"`.

---

### Task 9: Final QA pass + insert pending content

**Goal:** Verify the finished site end-to-end across viewports and states, and fold in the user-provided content (projects + Cloudflare token) if available.

**Files:**
- Modify: `index.html` (uncomment/fill Projects with provided content; replace `CF_TOKEN_PLACEHOLDER` with the real token if provided)

**Acceptance Criteria:**
- [ ] Renders correctly at 390px, 768px, 1280px (screenshots captured).
- [ ] Fully readable with JavaScript disabled; experience rows still expand.
- [ ] All links resolve (GitHub, LinkedIn, mailto, in-page anchors).
- [ ] All `<img>` have alt text; headings nest sanely; visible focus styles on nav/links/summaries.
- [ ] Total first-load weight < 300 KB (excl. fonts).
- [ ] If projects provided: cards populated and section uncommented. If token provided: beacon token set.

**Verify:** Screenshot at the three widths via the local server; run through the acceptance list; DevTools Lighthouse (or manual) confirms weight + a11y basics.

**Steps:**

- [ ] **Step 1:** Insert any provided Projects content (uncomment, fill cards, add images via Task 7 pipeline) and the real Cloudflare token.
- [ ] **Step 2:** Render and screenshot at 390/768/1280; fix any layout issues found.
- [ ] **Step 3:** JS-off check; tab-through focus check; link check.
- [ ] **Step 4: Commit** `git commit -m "Final QA: fold in projects + analytics token, polish"`.
- [ ] **Step 5:** Open a PR from `site-redesign` → `master` (matches the repo's PR workflow) for the user to review and merge/deploy.

---

## Notes for the executor

- Keep the local server (`python -m http.server 8765`) running for all render checks; never use `file://` (blocked).
- Match exact spacing/sizing against `mockups/_extracted.html` — the token values above are close but treat the bundle as the source of visual truth.
- The page must always render meaningfully with JS disabled — verify this after every section task, not just at the end.
- Frequent commits, one per task, as shown.
