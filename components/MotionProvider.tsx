"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global scroll reveal via IntersectionObserver: marks <html> motion-ready (so .reveal elements
 * adopt their hidden initial state) then reveals each as it enters the viewport. Skipped under
 * prefers-reduced-motion, leaving content visible and static. (Hero timeline, parallax, and
 * magnetic buttons are GSAP, handled in their own components.)
 *
 * This sits in the persistent root layout, so it must RE-SCAN on every route change — App Router
 * soft-navigation swaps page content without remounting the layout, and the new page's `.reveal`
 * elements (hidden by `.motion-ready`) would otherwise never get observed → invisible until reload.
 */
export function MotionProvider() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("motion-ready"); // idempotent; kept across navigations
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    // In-view elements reveal immediately (no flash); below-fold reveal on scroll.
    document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      else io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
