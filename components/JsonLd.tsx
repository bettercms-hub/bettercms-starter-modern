/** Render JSON-LD structured data (one <script> per schema object). 50 KB cap per object, matching
 *  the platform's serving limit, so an oversized blob can't bloat the page. */
export function JsonLd({ data }: { data: Array<Record<string, unknown>> }) {
  return (
    <>
      {data.filter(Boolean).map((schema, i) => {
        const json = JSON.stringify(schema);
        if (json.length > 50_000) return null;
        return <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
      })}
    </>
  );
}
