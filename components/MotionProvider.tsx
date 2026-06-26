"use client";

import { useEffect } from "react";

/**
 * Global scroll reveal via IntersectionObserver: marks <html> motion-ready (so .reveal elements
 * adopt their hidden initial state) then reveals each as it enters the viewport. Skipped under
 * prefers-reduced-motion, leaving content visible and static. (Hero timeline, parallax, and
 * magnetic buttons are GSAP, handled in their own components.)
 */
export function MotionProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    // In-view elements reveal immediately (no flash); below-fold reveal on scroll.
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      else io.observe(el);
    });
    return () => { io.disconnect(); root.classList.remove("motion-ready"); };
  }, []);
  return null;
}
