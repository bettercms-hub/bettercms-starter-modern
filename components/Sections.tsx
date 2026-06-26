import { items, type Feature, type Home, type Logo, type Stat, type Testimonial } from "../lib/cms";
import { bcmsField } from "../lib/bcms";
import { MagneticLink } from "./MagneticLink";

export function Stats({ data, onInk = false }: { data?: Stat[]; onInk?: boolean }) {
  const list = data ?? [];
  if (!list.length) return null;
  return (
    <div className={`stats${onInk ? "" : ""} reveal`} {...bcmsField("home.stats", "array")}>
      {list.map((s, i) => (
        <div className="stat" key={i}>
          <div className="num">{s.value}</div>
          <div className="lbl">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Features({ heading, data }: { heading?: string; data: Feature[] }) {
  if (!data.length) return null;
  return (
    <section className="section container">
      {heading && (
        <div className="section-head reveal">
          <p className="eyebrow">What we do</p>
          <h2 {...bcmsField("home.featuresHeading")}>{heading}</h2>
        </div>
      )}
      <div className="bento" {...bcmsField("home.features", "array")}>
        {data.map((f, i) => (
          <article className="feature reveal" key={i}>
            {f.icon && <div className="ic" aria-hidden>{f.icon}</div>}
            <h3>{f.title}</h3>
            {f.body && <p>{f.body}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

export function LogoMarquee({ data }: { data: Logo[] }) {
  if (!data.length) return null;
  const loop = [...data, ...data]; // duplicated for a seamless -50% scroll
  return (
    <section className="section--tight">
      <div className="container reveal">
        <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Trusted by teams who care about craft</p>
      </div>
      <div className="marquee" {...bcmsField("home.logos", "array")}>
        <div className="marquee-track">
          {loop.map((l, i) => <span className="logo" key={i}>{l.name ?? l.image?.alt}</span>)}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ data }: { data: Testimonial[] }) {
  if (!data.length) return null;
  return (
    <section className="section container">
      <div className="section-head reveal">
        <p className="eyebrow">In their words</p>
        <h2>What partners say</h2>
      </div>
      <div className="quotes" {...bcmsField("home.testimonials", "array")}>
        {data.map((t, i) => (
          <figure className="quote reveal" key={i}>
            <blockquote>“{t.quote}”</blockquote>
            <figcaption className="who">
              {t.avatar?.url && <img src={t.avatar.url} alt={t.avatar.alt ?? t.authorName ?? ""} />}
              <span>
                {t.authorName && <span className="name">{t.authorName}</span>}
                {t.authorRole && <span className="role">{t.authorRole ? ` — ${t.authorRole}` : ""}</span>}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function CtaBand({ data }: { data: Home }) {
  if (!data.ctaHeading) return null;
  return (
    <section className="section container">
      <div className="cta on-ink reveal">
        <h2 {...bcmsField("home.ctaHeading")}>{data.ctaHeading}</h2>
        {data.ctaBody && <p className="lead" {...bcmsField("home.ctaBody")}>{data.ctaBody}</p>}
        {data.ctaButtonText && data.ctaButtonHref && (
          <MagneticLink href={data.ctaButtonHref} className="btn btn--accent">
            {data.ctaButtonText} <span className="arrow">→</span>
          </MagneticLink>
        )}
      </div>
    </section>
  );
}
