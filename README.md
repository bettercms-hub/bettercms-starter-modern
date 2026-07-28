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
- **Site search** — a ⌘K modal over the public delivery search API (`@bettercms-ai/sdk`'s `search()`).
- **Forms** — Contact + newsletter via `submitForm()` → `/api/v1/forms/public/:id/submissions`
  (honeypot, conditional fields, per-field validation).
- **SEO + schema markup** — per-page `<title>`/OG/Twitter via `resolveSeo()`, plus JSON-LD
  (Organization, WebSite, BlogPosting, Article).
- **Custom code** — the `site` model's `customHeadHtml` / `customBodyEndHtml` are injected into the
  static document (inline tags parse and execute natively on load).
- **Live preview** — editable fields carry `data-bcms-field` attributes on every build, so the
  dashboard live preview maps them to inline editors.

## Known limitation — this starter does not render BetterCMS *pages*

This is a **hand-authored showcase**, not a block-driven site. Every section (`Hero`, `Stats`,
`Features`, `Testimonials`, `CtaBand`, the contact and newsletter forms) is a bespoke React
component reading typed fields off the `home` / `about` / `contact` singletons. Accordingly
`scripts/fetch-content.mjs` fetches **entries and forms only — never `pages`**, and nothing here
mounts `<BcmsBlocks>`. Its only BetterCMS dependency is `@bettercms-ai/sdk`.

**What that means:** anything you place on a *page* in the Visual Editor — a form block, a
section, a slider — renders **nothing** on this site. Those pages have no route here at all.
Edit the content-model entries instead; the BetterCMS entry form is the editing surface for this
design, and live preview still maps to it through `data-bcms-field`.

**If you want the Visual Editor's block canvas to drive the site**, use `bettercms-starter`
(Next) or `bettercms-starter-astro` — both mount `<BcmsBlocks>` and render whatever the builder
produces. Don't try to mix the two on one page: a page is either block-driven or field-driven,
and adding fields to a block page breaks its canvas binding.

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
