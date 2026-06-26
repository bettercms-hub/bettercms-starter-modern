import type { Metadata } from "next";
import { listEntries } from "../../lib/content";
import type { CaseStudy } from "../../lib/cms";
import { CaseCard } from "../../components/Cards";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected client work and the outcomes we shipped.",
};

export default function CaseStudiesIndex() {
  const studies = listEntries<CaseStudy>("case-study");
  return (
    <main className="section container">
      <div className="section-head reveal">
        <p className="eyebrow">Selected work</p>
        <h1>Outcomes we're proud of</h1>
      </div>
      {studies.length ? (
        <div className="card-grid">{studies.map((s) => <CaseCard key={s.slug} study={s} />)}</div>
      ) : (
        <p className="lead" style={{ marginTop: "2rem" }}>No case studies published yet.</p>
      )}
    </main>
  );
}
