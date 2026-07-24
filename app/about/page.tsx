import type { Metadata } from "next";
import { getSingleton } from "../../lib/content";
import { items, plain, refList, richHtml, type About, type Author } from "../../lib/cms";
import { bcmsField } from "../../lib/bcms";
import { seo } from "../../lib/seo";
import { JsonLd } from "../../components/JsonLd";

export function generateMetadata(): Metadata {
  const about = getSingleton<About>("about");
  return seo({ title: plain(about?.heroTitle) || "About", metaDescription: plain(about?.heroSubtitle) }).metadata;
}

export default function AboutPage() {
  const about = getSingleton<About>("about");
  if (!about) return <main className="container section"><h1>About</h1></main>;

  const values = items(about.values);
  const stats = items(about.stats);
  const team = refList<Author>(about.team);
  const { jsonLd } = seo({
    title: plain(about.heroTitle) || "About",
    metaDescription: plain(about.heroSubtitle),
    schema: { "@context": "https://schema.org", "@type": "AboutPage", name: plain(about.heroTitle) },
  });

  return (
    <main>
      <JsonLd data={jsonLd} />

      <section className="section container">
        <div className="section-head reveal">
          {about.eyebrow && <p className="eyebrow" {...bcmsField("about.eyebrow")} dangerouslySetInnerHTML={richHtml(about.eyebrow)} />}
          <h1 {...bcmsField("about.heroTitle")} dangerouslySetInnerHTML={richHtml(about.heroTitle, "About")} />
          {about.heroSubtitle && <p className="lead" style={{ marginTop: "1.25rem" }} {...bcmsField("about.heroSubtitle")} dangerouslySetInnerHTML={richHtml(about.heroSubtitle)} />}
        </div>
        {about.heroImage?.url && (
          <figure className="hero-figure reveal" style={{ marginTop: "3rem" }} {...bcmsField("about.heroImage", "image")}>
            <img src={about.heroImage.url} alt={about.heroImage.alt ?? ""} />
          </figure>
        )}
      </section>

      {about.story?.html && (
        <section className="section--tight container">
          <div className="article" style={{ paddingBlock: 0 }}>
            {about.storyTitle && <h2 className="reveal" {...bcmsField("about.storyTitle")} dangerouslySetInnerHTML={richHtml(about.storyTitle)} />}
            <div className="prose reveal" style={{ marginTop: "1.5rem" }} {...bcmsField("about.story", "richtext")} dangerouslySetInnerHTML={{ __html: about.story.html }} />
          </div>
        </section>
      )}

      {values.length > 0 && (
        <section className="section container">
          <div className="section-head reveal"><p className="eyebrow">How we work</p><h2>What we value</h2></div>
          <div className="bento" {...bcmsField("about.values", "array")}>
            {values.map((v, i) => (
              <article className="feature reveal" key={i}><h3>{v.title}</h3>{v.body && <p>{v.body}</p>}</article>
            ))}
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section className="section--tight"><div className="container"><div className="stats reveal" {...bcmsField("about.stats", "array")}>
          {stats.map((s, i) => <div className="stat" key={i}><div className="num">{s.value}</div><div className="lbl">{s.label}</div></div>)}
        </div></div></section>
      )}

      {team.length > 0 && (
        <section className="section container">
          <div className="section-head reveal"><p className="eyebrow">The people</p><h2>Meet the studio</h2></div>
          <div className="card-grid" {...bcmsField("about.team", "reference")}>
            {team.map((m, i) => (
              <article className="feature reveal" key={i} style={{ display: "grid", gap: "1rem" }}>
                {m.avatar?.url && <img src={m.avatar.url} alt={m.avatar.alt ?? m.name} style={{ width: "4rem", height: "4rem", borderRadius: "999px", objectFit: "cover" }} />}
                <div><h3 style={{ fontSize: "var(--step-1)" }}>{m.name}</h3>{m.role && <p style={{ color: "var(--accent-strong)", fontWeight: 600 }}>{m.role}</p>}</div>
                {m.bio && <p style={{ color: "var(--muted)" }}>{m.bio}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
