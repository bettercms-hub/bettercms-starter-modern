import type { ReactNode } from "react";
import "./globals.css";
import { getForm, getProjectId, getSingleton, searchPathMap } from "../lib/content";
import type { Site } from "../lib/cms";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { MotionProvider } from "../components/MotionProvider";

export const metadata = {
  title: "Modern Aesthetic — BetterCMS Starter",
  description: "A premium, animated studio site powered by BetterCMS.",
};

/**
 * Root chrome: fonts, global motion, nav + footer (from the `site` singleton), and the site's
 * custom code. Custom head/body code is the editor's raw HTML; with `output: export` it is written
 * into the static document, so inline tags parse and execute natively on load. Head-slot code is
 * injected at body start (App Router owns <head>); body-end code at the end of <body>.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  const site = getSingleton<Site>("site");
  const projectId = getProjectId();
  const newsletter = getForm("Newsletter");
  const pathMap = searchPathMap();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gloock&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {site?.customHeadHtml && <div dangerouslySetInnerHTML={{ __html: site.customHeadHtml }} />}
        <MotionProvider />
        <Nav site={site} projectId={projectId} pathMap={pathMap} />
        {children}
        <Footer site={site} newsletter={newsletter} />
        {site?.customBodyEndHtml && <div dangerouslySetInnerHTML={{ __html: site.customBodyEndHtml }} />}
      </body>
    </html>
  );
}
