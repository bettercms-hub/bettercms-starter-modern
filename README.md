# BetterCMS — Modern Aesthetic Starter (Next.js)

A premium, animated studio site rendered from a BetterCMS project. Content (Home, About, Contact,
Blog, Case Studies, site settings) lives in BetterCMS content models; this repo owns the design,
routing, and motion. Pair it with the **Modern Aesthetic** template when you create a project, or
point it at any BetterCMS project with the same model slugs.

## What it demonstrates

- **Bespoke, content-model-driven pages** — Home/About/Contact are structured singletons, Blog and
  Case Studies are collections. Every section is editable in the BetterCMS entry form.
- **Animation** — GSAP + ScrollTrigger (hero word-reveal, parallax, staggered scroll reveals,
  magnetic CTAs, logo marquee). Fully respects `prefers-reduced-motion`.
- **Site search** — a ⌘K modal over the public delivery search API (`@betttercms/sdk`'s `search()`).
- **Forms** — Contact + newsletter via `submitForm()` → `/api/v1/forms/public/:id/submissions`
  (honeypot, conditional fields, per-field validation).
- **SEO + schema markup** — per-page `<title>`/OG/Twitter via `resolveSeo()`, plus JSON-LD
  (Organization, WebSite, BlogPosting, Article).
- **Custom code** — the `site` model's `customHeadHtml` / `customBodyEndHtml` are injected into the
  static document (inline tags parse and execute natively on load).
- **Live preview** — editable fields carry `data-bcms-field` attributes when built with
  `BCMS_ANNOTATE=1`, so the dashboard live preview maps them to inline editors.

## Local development

```bash
cp .env.example .env   # set BETTERCMS_WORKSPACE + BETTERCMS_API_KEY
npm install
npm run fetch-content  # writes bcms-content.json from the delivery API
npm run dev
```

`npm run build` produces a fully static `out/`. On BetterCMS hosting the deploy Action runs
`fetch-content` (injecting the API key + project id) before `next build`, so no key is needed at
build time.

## Content model slugs

`site` · `home` · `about` · `contact` · `blog-post` · `case-study` · `author`. The Modern Aesthetic
template seeds all of these with sample content and a working Contact form.
