import { Fragment, type ReactNode } from "react";
import { sectionRootAttrs } from "@bettercms-ai/next";
import type { PlannedSection } from "../lib/sections";

/**
 * Renders a page's sections in the order its BetterCMS block list gives (`sectionPlan`).
 *
 * `render` maps each section's name to what draws it. Each planned section renders inside a root that
 * carries its block's id and style (`sectionRootAttrs`: `data-bcms-block`, `data-bcms-style`), which is
 * how the Visual Editor finds, moves and styles it — and how BetterCMS sees that this site follows the
 * order set in the editor. A name the plan repeats (a duplicated section) renders twice.
 */
export function PageSections({ sections, render }: { sections: PlannedSection[]; render: Record<string, () => ReactNode> }) {
  return (
    <>
      {sections.map((s, i) => {
        const node = render[s.bind]?.();
        if (!node) return null;
        return s.block ? (
          <div key={s.block.id ?? `${s.bind}-${i}`} {...sectionRootAttrs(s.block)}>{node}</div>
        ) : (
          <Fragment key={`${s.bind}-${i}`}>{node}</Fragment>
        );
      })}
    </>
  );
}
