import Link from "next/link";
import { refData, richHtml, type Author, type BlogPost, type CaseStudy } from "../lib/cms";
import type { Entry } from "../lib/content";

/**
 * ⚠️ Deliberately carries NO `bcmsField` bindings. Cards render on the /blog and /case-studies INDEX
 * pages, where every card belongs to a DIFFERENT entry than the one the Visual Editor has loaded.
 * `data-bcms-field` paths are rooted at the loaded entry, so a card path would look bound and edit
 * nothing (or worse, the wrong entry). Post/study fields are bound on their detail pages instead.
 */
export function BlogCard({ post }: { post: Entry<BlogPost> }) {
  const f = post.data;
  const author = refData<Author>(f.author);
  return (
    <Link href={`/blog/${post.slug}`} className="card reveal">
      {f.coverImage?.url && (
        <div className="thumb"><img src={f.coverImage.url} alt={f.coverImage.alt ?? ""} loading="lazy" /></div>
      )}
      <div className="body">
        {f.tags?.[0] && <span className="kicker">{f.tags[0]}</span>}
        <h3 dangerouslySetInnerHTML={richHtml(f.title)} />
        {f.excerpt && <p dangerouslySetInnerHTML={richHtml(f.excerpt)} />}
        <div className="meta">{author ? `${author.name} · ` : ""}{f.publishedDate}</div>
      </div>
    </Link>
  );
}

export function CaseCard({ study }: { study: Entry<CaseStudy> }) {
  const f = study.data;
  return (
    <Link href={`/case-studies/${study.slug}`} className="card reveal">
      {f.coverImage?.url && (
        <div className="thumb"><img src={f.coverImage.url} alt={f.coverImage.alt ?? ""} loading="lazy" /></div>
      )}
      <div className="body">
        {f.client && <span className="kicker">{f.client}</span>}
        <h3 dangerouslySetInnerHTML={richHtml(f.title)} />
        {f.summary && <p dangerouslySetInnerHTML={richHtml(f.summary)} />}
      </div>
    </Link>
  );
}
