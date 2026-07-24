import type { Metadata } from "next";
import { resolveSeo } from "@bettercms-ai/sdk";
import { getSingleton } from "./content";
import { plain, type Author, type BlogPost, type CaseStudy, type Site } from "./cms";

/** SEO input for a single route: title + description, with optional JSON-LD schema for the page. */
type SeoInput = {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
};

type Json = Record<string, unknown>;

function site(): Site | undefined {
  return getSingleton<Site>("site");
}

/** Site-wide SEO defaults + Organization schema, fed to every page via resolveSeo(). */
function defaults() {
  const s = site();
  return {
    metaTitle: s?.seoTitle,
    metaDescription: s?.seoDescription,
    ogImage: s?.ogImage?.url ?? null,
    twitterHandle: s?.twitterHandle ?? null,
    siteSchema: s ? organizationSchema(s) : undefined,
  };
}

/**
 * Resolve a route's `<head>` metadata + JSON-LD. The SDK's resolveSeo() merges site defaults with
 * the page input (title/og/twitter/canonical) and returns the combined JSON-LD array
 * (Organization + this page's schema).
 */
export function seo(input: SeoInput): { metadata: Metadata; jsonLd: Json[] } {
  const r = resolveSeo(
    { title: input.title, metaTitle: input.metaTitle, metaDescription: input.metaDescription, metaJson: { schema: input.schema } },
    defaults(),
  );
  const metadata: Metadata = {
    title: r.title,
    description: r.description,
    alternates: r.canonical ? { canonical: r.canonical } : undefined,
    openGraph: {
      title: r.og.title,
      description: r.og.description,
      type: r.og.type === "article" ? "article" : "website",
      url: r.og.url || undefined,
      images: r.og.image ? [r.og.image] : undefined,
    },
    twitter: {
      card: r.twitter.card === "summary" ? "summary" : "summary_large_image",
      title: r.twitter.title,
      description: r.twitter.description,
      images: r.twitter.image ? [r.twitter.image] : undefined,
    },
  };
  return { metadata, jsonLd: r.jsonLd as Json[] };
}

// ── Schema builders (https://schema.org) ────────────────────────────────────────────────────────

export function organizationSchema(s: Site): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.brandName,
    description: s.seoDescription,
    ...(s.ogImage?.url ? { logo: s.ogImage.url } : {}),
  };
}

export function blogPostingSchema(post: BlogPost, author: Author | null): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: plain(post.title),
    description: plain(post.excerpt),
    ...(post.coverImage?.url ? { image: post.coverImage.url } : {}),
    ...(post.publishedDate ? { datePublished: post.publishedDate } : {}),
    ...(author ? { author: { "@type": "Person", name: author.name, jobTitle: author.role } } : {}),
  };
}

export function caseStudySchema(c: CaseStudy): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: plain(c.title),
    description: plain(c.summary),
    ...(c.coverImage?.url ? { image: c.coverImage.url } : {}),
    ...(c.publishedDate ? { datePublished: c.publishedDate } : {}),
    ...(c.client ? { about: c.client } : {}),
  };
}
