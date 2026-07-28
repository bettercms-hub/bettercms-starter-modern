import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEntry, listEntries } from "../../../lib/content";
import { items, plain, richHtml, type CaseStudy } from "../../../lib/cms";
import { bcmsField } from "../../../lib/bcms";
import { seo, caseStudySchema } from "../../../lib/seo";
import { JsonLd } from "../../../components/JsonLd";

export const dynamicParams = false;
export function generateStaticParams() {
  return listEntries<CaseStudy>("case-study").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = getEntry<CaseStudy>("case-study", slug);
  return study ? seo({ title: plain(study.data.title), metaDescription: plain(study.data.summary) }).metadata : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getEntry<CaseStudy>("case-study", slug);
  if (!study) notFound();

  const f = study.data;
  const metrics = items(f.metrics);
  const { jsonLd } = seo({ title: plain(f.title), metaDescription: plain(f.summary), schema: caseStudySchema(f) });

  return (
    <main>
      <JsonLd data={jsonLd} />
      <article className="article">
        <Link className="back-link" href="/case-studies">← Back to work</Link>
        {f.client && <p className="kicker" {...bcmsField("client")} style={{ color: "var(--accent-strong)", fontWeight: 600, marginTop: "1.5rem" }}>{f.client}</p>}
        <h1 {...bcmsField("title")} style={{ marginTop: "0.5rem" }} dangerouslySetInnerHTML={richHtml(f.title)} />
        {f.summary && <p className="lead" {...bcmsField("summary")} style={{ marginTop: "1rem" }} dangerouslySetInnerHTML={richHtml(f.summary)} />}
        {f.coverImage?.url && <img className="cover" {...bcmsField("coverImage", "image")} src={f.coverImage.url} alt={f.coverImage.alt ?? ""} />}
        {metrics.length > 0 && (
          <div className="stats" style={{ marginBottom: "2rem" }} {...bcmsField("metrics", "array")}>
            {metrics.map((m, i) => <div className="stat" key={i}><div className="num" {...bcmsField(`case-study.metrics[${i}].value`)}>{m.value}</div><div className="lbl" {...bcmsField(`case-study.metrics[${i}].label`)}>{m.label}</div></div>)}
          </div>
        )}
        {f.body?.html && <div className="prose" {...bcmsField("body", "richtext")} dangerouslySetInnerHTML={{ __html: f.body.html }} />}
      </article>
    </main>
  );
}
