import { items, type Feature, type Home, type Logo, type Stat, type Testimonial } from "../lib/cms";
import { bcmsField } from "../lib/bcms";
import { MagneticLink } from "./MagneticLink";

export function Stats({ data, onInk = false }: { data?: Stat[]; onInk?: boolean }) {
  const list = data ?? [];
  if (!list.length) return null;
  return (
    <div className={`stats${onInk ? "" : ""} reveal`} {...bcmsField("stats", "array")}>
      {list.map((s, i) => (
        <div className="stat" key={s.label ?? i}>
          <div className="num" {...bcmsField(`home.stats[${i}].value`)}>{s.value}</div>
          <div className="lbl" {...bcmsField(`home.stats[${i}].label`)}>{s.label}</div>
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
          <h2 {...bcmsField("featuresHeading")}>{heading}</h2>
        </div>
      )}
      <div className="bento" {...bcmsField("features", "array")}>
        {data.map((f, i) => (
          <article className="feature reveal" key={f.title ?? i}>
            {f.icon && <div className="ic" aria-hidden {...bcmsField(`home.features[${i}].icon`)}>{f.icon}</div>}
            <h3 {...bcmsField(`home.features[${i}].title`)}>{f.title}</h3>
            {f.body && <p {...bcmsField(`home.features[${i}].body`)}>{f.body}</p>}
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
      <div className="marquee" {...bcmsField("logos", "array")}>
        <div className="marquee-track">
          {/* Only the array root is bound: the track renders every logo TWICE for the seamless loop, and
              the dashboard drops a `data-bcms-field` path carried by more than one element (it stamps
              neither). Per-logo editing happens in the inspector. */}
          {loop.map((l, i) => <span className="logo" key={`${l.name ?? l.image?.alt}-${i}`}>{l.name ?? l.image?.alt}</span>)}
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
      <div className="quotes" {...bcmsField("testimonials", "array")}>
        {data.map((t, i) => (
          <figure className="quote reveal" key={t.authorName ?? t.quote ?? i}>
            <blockquote {...bcmsField(`home.testimonials[${i}].quote`)}>“{t.quote}”</blockquote>
            <figcaption className="who">
              {t.avatar?.url && <img src={t.avatar.url} alt={t.avatar.alt ?? t.authorName ?? ""} {...bcmsField(`home.testimonials[${i}].avatar`, "image")} />}
              <span>
                {t.authorName && <span className="name" {...bcmsField(`home.testimonials[${i}].authorName`)}>{t.authorName}</span>}
                {t.authorRole && <span className="role" {...bcmsField(`home.testimonials[${i}].authorRole`)}>{t.authorRole ? ` — ${t.authorRole}` : ""}</span>}
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
        <h2 {...bcmsField("ctaHeading")}>{data.ctaHeading}</h2>
        {data.ctaBody && <p className="lead" {...bcmsField("ctaBody")}>{data.ctaBody}</p>}
        {data.ctaButtonText && data.ctaButtonHref && (
          <MagneticLink href={data.ctaButtonHref} className="btn btn--accent">
            {data.ctaButtonText} <span className="arrow">→</span>
          </MagneticLink>
        )}
      </div>
    </section>
  );
}
