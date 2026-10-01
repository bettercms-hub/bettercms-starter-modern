"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * Wraps a button so it gently follows the pointer (magnetic). No-op under reduced motion.
 * A wrapper rather than a link of its own, so the button inside can be any element — here the
 * `<BcmsButton>` the BetterCMS editor finds as one button.
 */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      };
      const reset = () => { xTo(0); yTo(0); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", reset);
      return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", reset); };
    },
    { scope: ref },
  );

  return <span ref={ref} className="magnetic">{children}</span>;
}
