"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchModal } from "./SearchModal";
import { items, type NavLink, type Site } from "../lib/cms";

export function Nav({ site, projectId, pathMap }: { site?: Site; projectId: string | null; pathMap: Record<string, string> }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const links: NavLink[] = items(site?.navLinks);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <nav className={`nav${scrolled ? " scrolled" : ""}`}>
          <Link href="/" className="brand">{site?.brandName ?? "Studio"}<span className="dot">.</span></Link>

          <div className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
            {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </div>

          <div className="nav-right">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <span aria-hidden>⌕</span>
              <span className="label-full">Search</span>
              <kbd className="kbd-hint">⌘K</kbd>
            </button>
            <button
              className="icon-btn nav-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </nav>
      </div>
      <SearchModal project={projectId} pathMap={pathMap} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
