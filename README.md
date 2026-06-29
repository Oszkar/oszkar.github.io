# oszkar.me

Source for my personal website, [oszkar.me](https://oszkar.me) — a single-page site about my work in robotics, autonomous driving, and developer platforms.

## Stack

Hand-built static site, no framework and no build step:

- `index.html` — the whole page (semantic HTML, SEO/OpenGraph/JSON-LD metadata)
- `css/style.css` — one stylesheet (CSS custom properties, no framework)
- `js/main.js` — a few lines of vanilla JS for active-nav highlighting (progressive enhancement; the site works without it)
- `img/` — optimized photos

Deployed via GitHub Pages on the custom domain `oszkar.me`. Analytics via Cloudflare Web Analytics (cookieless).

## Local preview

```bash
python -m http.server 8765
# then open http://localhost:8765/
```

## License

Code is released under the [MIT License](LICENSE).
