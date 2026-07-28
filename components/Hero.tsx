"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticLink } from "./MagneticLink";
import { bcmsField } from "../lib/bcms";
import { plain, richHtml, type Home, type TextOrRich } from "../lib/cms";

gsap.registerPlugin(ScrollTrigger);

/** Split a heading into per-word spans for the clipped reveal. */
function Words({ text }: { text?: TextOrRich }) {
  // ponytail: the reveal splits on words, so the hero title renders as text here. Inline marks
  // would need an HTML-aware splitter — the Astro twin gets them because it splits at runtime.
  const words = plain(text).split(" ");
  return (
    <span className="reveal-words">
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word"><span>{w}</span></span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}

export function Hero({ data }: { data: Home }) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { autoAlpha: 0, y: 12, duration: 0.5 })
        .from(".reveal-words .word > span", { yPercent: 115, duration: 0.9, stagger: 0.06 }, "-=0.2")
        .from(".hero-lead", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.5")
        .from(".hero-cta > *", { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.1 }, "-=0.4")
        .from(".hero-figure", { autoAlpha: 0, y: 48, scale: 0.98, duration: 1 }, "-=0.5");

      gsap.to(".hero-figure img", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope },
  );

  return (
    <section className="hero on-ink" ref={scope}>
      <div className="container">
        {data.eyebrow && <p className="eyebrow hero-eyebrow" {...bcmsField("eyebrow")} dangerouslySetInnerHTML={richHtml(data.eyebrow)} />}
        <h1 {...bcmsField("heroTitle")}><Words text={data.heroTitle} /></h1>
        {data.heroSubtitle && <p className="lead hero-lead" {...bcmsField("heroSubtitle")} dangerouslySetInnerHTML={richHtml(data.heroSubtitle)} />}
        <div className="hero-cta">
          {data.primaryCtaText && data.primaryCtaHref && (
            <MagneticLink href={data.primaryCtaHref} className="btn btn--accent">
              {data.primaryCtaText} <span className="arrow">→</span>
            </MagneticLink>
          )}
          {data.secondaryCtaText && data.secondaryCtaHref && (
            <MagneticLink href={data.secondaryCtaHref} className="btn btn--ghost">{data.secondaryCtaText}</MagneticLink>
          )}
        </div>
      </div>
      {data.heroImage?.url && (
        <div className="container">
          <figure className="hero-figure" {...bcmsField("heroImage", "image")}>
            <img src={data.heroImage.url} alt={data.heroImage.alt ?? ""} />
          </figure>
        </div>
      )}
    </section>
  );
}
