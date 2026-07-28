import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEntry, listEntries } from "../../../lib/content";
import { plain, refData, richHtml, type Author, type BlogPost } from "../../../lib/cms";
import { bcmsField } from "../../../lib/bcms";
import { seo, blogPostingSchema } from "../../../lib/seo";
import { JsonLd } from "../../../components/JsonLd";

export const dynamicParams = false;
export function generateStaticParams() {
  return listEntries<BlogPost>("blog-post").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getEntry<BlogPost>("blog-post", slug);
  return post ? seo({ title: plain(post.data.title), metaDescription: plain(post.data.excerpt) }).metadata : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getEntry<BlogPost>("blog-post", slug);
  if (!post) notFound();

  const f = post.data;
  const author = refData<Author>(f.author);
  const { jsonLd } = seo({ title: plain(f.title), metaDescription: plain(f.excerpt), schema: blogPostingSchema(f, author) });

  return (
    <main>
      <JsonLd data={jsonLd} />
      <article className="article">
        <Link className="back-link" href="/blog">← Back to journal</Link>
        {f.tags?.[0] && <p className="kicker" {...bcmsField("tags[0]")} style={{ color: "var(--accent-strong)", fontWeight: 600, marginTop: "1.5rem" }}>{f.tags[0]}</p>}
        <h1 {...bcmsField("title")} style={{ marginTop: "0.5rem" }} dangerouslySetInnerHTML={richHtml(f.title)} />
        {/* The byline is a COMPOSITE: `author` is a reference (its name/role live on the author entry)
            and `publishedDate` is interleaved with separator text, so no single field owns this <p>. */}
        <p className="byline">
          {author && <>By <strong>{author.name}</strong>{author.role ? `, ${author.role}` : ""}</>}
          {author && f.publishedDate ? " · " : ""}{f.publishedDate}
        </p>
        {f.coverImage?.url && <img className="cover" {...bcmsField("coverImage", "image")} src={f.coverImage.url} alt={f.coverImage.alt ?? ""} />}
        {f.body?.html && <div className="prose" {...bcmsField("body", "richtext")} dangerouslySetInnerHTML={{ __html: f.body.html }} />}
      </article>
    </main>
  );
}
