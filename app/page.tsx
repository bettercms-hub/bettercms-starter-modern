import type { Metadata } from "next";
import { getSingleton } from "../lib/content";
import { items, plain, type Home, type Site } from "../lib/cms";
import { seo } from "../lib/seo";
import { JsonLd } from "../components/JsonLd";
import { Hero } from "../components/Hero";
import { Stats, Features, LogoMarquee, Testimonials, CtaBand } from "../components/Sections";

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
      <Hero data={home} />
      <section className="section--tight"><div className="container"><Stats data={items(home.stats)} /></div></section>
      <Features heading={home.featuresHeading} data={items(home.features)} />
      <LogoMarquee data={items(home.logos)} />
      <Testimonials data={items(home.testimonials)} />
      <CtaBand data={home} />
    </>
  );
}
