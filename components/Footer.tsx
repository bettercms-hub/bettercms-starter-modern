import Link from "next/link";
import type { DeliveryForm } from "@bettercms-ai/sdk";
import { items, type NavLink, type Site, type Social } from "../lib/cms";
import { getForms } from "../lib/content";
import { NewsletterForm } from "./Forms";

export function Footer({ site, newsletter }: { site?: Site; newsletter?: DeliveryForm }) {
  const nav: NavLink[] = items(site?.navLinks);
  const socials: Social[] = items(site?.socials);
  const brand = site?.brandName ?? "Studio";

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand">{brand}<span className="dot">.</span></Link>
            {site?.footerTagline && <p className="tagline">{site.footerTagline}</p>}
            {socials.length > 0 && (
              <div className="socials">
                {socials.map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                ))}
              </div>
            )}
          </div>
          <div className="stack">
            {nav.length > 0 && (
              <nav className="socials" aria-label="Footer">
                {nav.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              </nav>
            )}
            {newsletter && (
              <div>
                <p className="tagline" style={{ marginTop: 0 }}>The studio journal, occasionally.</p>
                <NewsletterForm form={newsletter} turnstileSiteKey={getForms().turnstileSiteKey} />
              </div>
            )}
          </div>
        </div>
        <div className="colophon">
          <span>© {brand}. Built with BetterCMS.</span>
          <span>Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
}
