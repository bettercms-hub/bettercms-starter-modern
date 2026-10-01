import type { Metadata } from "next";
import { getPageBlocks, getSingleton } from "../lib/content";
import { sectionPlan } from "../lib/sections";
import { PageSections } from "../components/PageSections";
import { items, plain, type Home, type Site } from "../lib/cms";
import { seo } from "../lib/seo";
import { JsonLd } from "../components/JsonLd";
import { Hero } from "../components/Hero";
import { Stats, Features, LogoMarquee, Testimonials, CtaBand, HeroCtas } from "../components/Sections";

export function generateMetadata(): Metadata {
  const home = getSingleton<Home>("home");
  return seo({ title: plain(home?.heroTitle) || "Home", metaDescription: plain(home?.heroSubtitle) }).metadata;
}

export default function HomePage() {
  const home = getSingleton<Home>("home");
  if (!home) {
    return (
      <main className="container section">
        <h1>Home</h1>
        <p className="lead">Publish the Home content in BetterCMS to populate this page.</p>
      </main>
    );
  }
  const site = getSingleton<Site>("site");
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site?.brandName,
    description: site?.seoDescription,
  };
  const { jsonLd } = seo({ title: plain(home.heroTitle) || "Home", metaDescription: plain(home.heroSubtitle), schema: websiteSchema });

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* The Home page's BetterCMS block list sets which sections render and in what order; the
          design's own order until the page has one. @see sectionPlan */}
      <PageSections
        sections={sectionPlan(getPageBlocks("home"), ["hero", "stats", "features", "logos", "testimonials", "cta"])}
        render={{
          hero: () => <Hero data={home} ctas={<HeroCtas data={home} />} />,
          stats: () => <section className="section--tight"><div className="container"><Stats data={items(home.stats)} /></div></section>,
          features: () => <Features heading={home.featuresHeading} data={items(home.features)} />,
          logos: () => <LogoMarquee data={items(home.logos)} />,
          testimonials: () => <Testimonials data={items(home.testimonials)} />,
          cta: () => <CtaBand data={home} />,
        }}
      />
    </>
  );
}
