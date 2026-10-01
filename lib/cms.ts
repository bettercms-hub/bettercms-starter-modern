/**
 * Content shapes seeded by the "Modern Aesthetic" template, plus tiny accessors for the stored
 * field-value shapes: images are `{ url, alt }`, richtext is `{ html }`, repeatable arrays are
 * `{ repeatable: [...] }`, and references hydrate to `{ slug, data }` at delivery depth ≥ 1.
 */
export type Image = { url: string; alt?: string };
export type RichText = { html?: string };
/**
 * A field that may arrive as EITHER a bare string or a rich-text envelope.
 *
 * Any `text` field can be switched to `richtext` in the Visual Editor (the canvas toolbar offers
 * it, so authors will), and from that moment delivery returns `{ format, value, html }` instead of
 * a string. React THROWS on an object child ("Objects are not valid as a React child"), so every
 * author-editable text field is typed this way and rendered through `richHtml()` (for markup) or
 * `plain()` (for attributes/SEO) — flipping the type in the CMS is then a no-op here.
 */
export type TextOrRich = string | RichText;
export type Repeatable<T> = { repeatable?: T[] };
/** A depth≥1 hydrated reference: the nested entry in raw delivery shape. */
export type Hydrated<T> = { slug: string; data?: T };

// ── Item shapes (zoned-array repeatable sub-objects) ────────────────────────────────────────────
export type NavLink = { label: string; href: string };
export type Social = { label: string; href: string };
export type Stat = { value: string; label: string };
export type Feature = { icon?: string; title: string; body?: string };
export type Logo = { name?: string; image?: Image };
export type Testimonial = { quote: string; authorName?: string; authorRole?: string; avatar?: Image };
export type ValueItem = { title: string; body?: string };
export type Metric = { value: string; label: string };

// ── Entry data shapes ───────────────────────────────────────────────────────────────────────────
export type Site = {
  brandName: string;
  navLinks?: Repeatable<NavLink>;
  footerTagline?: string;
  socials?: Repeatable<Social>;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: Image;
  twitterHandle?: string;
  customHeadHtml?: string;
  customBodyEndHtml?: string;
};

export type Author = { name: string; role?: string; bio?: string; avatar?: Image };

export type Home = {
  eyebrow?: TextOrRich;
  heroTitle: TextOrRich;
  heroSubtitle?: TextOrRich;
  heroImage?: Image;
  /** The hero's calls to action: one `button` field each. */
  primaryCta?: ButtonValue;
  secondaryCta?: ButtonValue;
  /** @deprecated The pair a site seeded before `primaryCta`; read only as its fallback. */
  primaryCtaText?: string;
  /** @deprecated @see primaryCtaText */
  primaryCtaHref?: string;
  /** @deprecated @see primaryCtaText */
  secondaryCtaText?: string;
  /** @deprecated @see primaryCtaText */
  secondaryCtaHref?: string;
  stats?: Repeatable<Stat>;
  featuresHeading?: string;
  features?: Repeatable<Feature>;
  logos?: Repeatable<Logo>;
  testimonials?: Repeatable<Testimonial>;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButton?: ButtonValue;
  /** @deprecated @see primaryCtaText */
  ctaButtonText?: string;
  /** @deprecated @see primaryCtaText */
  ctaButtonHref?: string;
};

// ── Buttons ───────────────────────────────────────────────────────────────────────────────────────
/**
 * A `button` field's value: the words, the link and the look an author picks in the BetterCMS
 * visual editor. Rendered with `<BcmsButton>` so the editor finds it as one button.
 */
export type ButtonValue = {
  label?: string;
  href?: string;
  variant?: string;
  size?: string;
  arrow?: boolean;
  icon?: string | null;
  newTab?: boolean;
};

/**
 * A call to action as one button value: the `button` field when it holds a label, else the flat
 * label + link pair a site seeded before the field existed — so a site built from an older copy of
 * this starter keeps its buttons. Null when neither has both words and a link.
 *
 * `look` is this button's default look, the one the design was drawn with: it applies only where
 * the author has not picked one, so an untouched site renders exactly as before.
 */
export function ctaButton(button: ButtonValue | undefined, label?: string, href?: string, look: Pick<ButtonValue, "variant" | "arrow"> = {}): ButtonValue | null {
  const value = button?.label ? button : { label, href };
  if (!value.label || !value.href) return null;
  return { ...look, ...value };
}

export type About = {
  eyebrow?: TextOrRich;
  heroTitle: TextOrRich;
  heroSubtitle?: TextOrRich;
  heroImage?: Image;
  storyTitle?: TextOrRich;
  story?: RichText;
  values?: Repeatable<ValueItem>;
  stats?: Repeatable<Stat>;
  team?: Hydrated<Author>[] | string[];
};

export type Contact = { eyebrow?: TextOrRich; heroTitle: TextOrRich; heroSubtitle?: TextOrRich };

export type BlogPost = {
  title: TextOrRich;
  excerpt?: TextOrRich;
  coverImage?: Image;
  body?: RichText;
  author?: Hydrated<Author> | string;
  publishedDate?: string;
  tags?: string[];
};

export type CaseStudy = {
  title: TextOrRich;
  client?: string;
  summary?: TextOrRich;
  coverImage?: Image;
  body?: RichText;
  metrics?: Repeatable<Metric>;
  publishedDate?: string;
};

// ── Accessors ─────────────────────────────────────────────────────────────────────────────────
/** Plain text from a text-or-rich field — for SEO titles/meta and other attribute contexts. */
export const plain = (rt?: TextOrRich): string =>
  typeof rt === "string" ? rt : decodeEntities((rt?.html ?? "").replace(/<[^>]+>/g, "")).trim();

/**
 * Renderable HTML for a text-or-rich field. Rich text keeps its inline marks (the server
 * sanitizes `html` at write time); a bare string is escaped, so a plain field can never inject
 * markup. Spread into an element: `<h1 dangerouslySetInnerHTML={richHtml(f.title)} />`.
 */
export const richHtml = (rt?: TextOrRich, fallback = ""): { __html: string } => {
  const html = (typeof rt === "string" ? escapeHtml(rt) : (rt?.html ?? "")).trim();
  return { __html: html ? unwrapLoneBlock(html) : escapeHtml(fallback) };
};

/**
 * A field converted from `text` stores its value as a block (`<p>…</p>`), but it is rendered
 * INSIDE the element that already is the block — an `<h1>`. `<h1><p>…</p></h1>` is invalid: the
 * parser closes the heading at the `<p>`, so the text falls out of the heading and loses its
 * styling. Unwrap a LONE wrapping block; a multi-block value keeps its structure.
 */
const unwrapLoneBlock = (html: string): string => {
  const m = html.match(/^<(p|div|h[1-6])(?:\s[^>]*)?>([\s\S]*)<\/\1>$/i);
  return m && !new RegExp(`</${m[1]}>`, "i").test(m[2]) ? m[2] : html;
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Entities survive tag-stripping; an attribute context would double-escape them. */
const decodeEntities = (s: string): string =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/** Unwrap a zoned-repeatable array field to a plain list. */
export const items = <T>(field?: Repeatable<T>): T[] => (Array.isArray(field?.repeatable) ? field.repeatable : []);

/** Resolve a single hydrated reference (bare id string at depth 0 → null). */
export const refData = <T>(ref?: Hydrated<T> | string): T | null =>
  ref && typeof ref === "object" ? (ref.data ?? null) : null;

/** Resolve a hydrated multi-reference list to the nested entries (drops un-hydrated ids). */
export const refList = <T>(refs?: Hydrated<T>[] | string[]): T[] =>
  Array.isArray(refs)
    ? refs.flatMap((r) => (r && typeof r === "object" && r.data ? [r.data] : []))
    : [];
