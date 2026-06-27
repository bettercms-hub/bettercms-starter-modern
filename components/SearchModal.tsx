"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_BCMS_API_URL || "https://api.bettercms.ai";

/** Public delivery search hit (GET /api/v1/delivery/search → { hits }). */
type Hit = { title: string; slug: string; type: "page" | "entry"; snippet: string; url: string };

/** ⌘K search over the public, Typesense-backed delivery search endpoint. `pathMap` rewrites each
 *  hit's slug to this site's real route (entries live under /blog and /case-studies). */
export function SearchModal({
  project,
  pathMap,
  open,
  onClose,
}: {
  project: string | null;
  pathMap: Record<string, string>;
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Array<Hit & { href: string }>>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else { setQ(""); setHits([]); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!project || q.trim().length < 2) { setHits([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `${API}/api/v1/delivery/search?project=${encodeURIComponent(project)}&q=${encodeURIComponent(q)}&limit=8`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = (await res.json()) as { hits?: Hit[] };
        const mapped = (data.hits ?? [])
          .map((h) => ({ ...h, href: pathMap[h.slug] ?? (h.type === "page" ? h.url : "") }))
          .filter((h) => h.href);
        setHits(mapped);
      } catch { /* aborted or offline — keep prior results */ }
      finally { setLoading(false); }
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, project, open, pathMap]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <span aria-hidden>⌕</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, work, pages…"
            aria-label="Search query"
          />
          <button className="icon-btn" onClick={onClose} aria-label="Close search">Esc</button>
        </div>
        <div className="search-results">
          {hits.map((h) => (
            <Link key={`${h.type}-${h.slug}`} href={h.href} className="search-hit" onClick={onClose}>
              <span className="search-kind">{h.type}</span>
              <span className="t">{h.title}</span>
              {h.snippet && <span className="s" dangerouslySetInnerHTML={{ __html: h.snippet }} />}
            </Link>
          ))}
          {!loading && q.trim().length >= 2 && hits.length === 0 && (
            <p className="search-empty">{project ? `No results for “${q}”.` : "Search is temporarily unavailable."}</p>
          )}
          {q.trim().length < 2 && <p className="search-empty">Type at least two characters to search.</p>}
        </div>
      </div>
    </div>
  );
}
