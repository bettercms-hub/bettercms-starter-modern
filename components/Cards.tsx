import Link from "next/link";
import { refData, type Author, type BlogPost, type CaseStudy } from "../lib/cms";
import type { Entry } from "../lib/content";

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
        <h3>{f.title}</h3>
        {f.excerpt && <p>{f.excerpt}</p>}
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
        <h3>{f.title}</h3>
        {f.summary && <p>{f.summary}</p>}
      </div>
    </Link>
  );
}
