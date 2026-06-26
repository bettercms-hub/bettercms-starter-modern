import type { Metadata } from "next";
import { listEntries } from "../../lib/content";
import type { BlogPost } from "../../lib/cms";
import { BlogCard } from "../../components/Cards";

export const metadata: Metadata = {
  title: "Journal",
  description: "Ideas on design, engineering, and the craft of shipping.",
};

export default function BlogIndex() {
  const posts = listEntries<BlogPost>("blog-post");
  return (
    <main className="section container">
      <div className="section-head reveal">
        <p className="eyebrow">Journal</p>
        <h1>Ideas on design, code, and craft</h1>
      </div>
      {posts.length ? (
        <div className="card-grid">{posts.map((p) => <BlogCard key={p.slug} post={p} />)}</div>
      ) : (
        <p className="lead" style={{ marginTop: "2rem" }}>No posts published yet.</p>
      )}
    </main>
  );
}
