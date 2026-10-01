/**
 * Which of a page's sections render, in which order — the page's BetterCMS block list decides.
 *
 * Every page here is drawn by this repo's own components (`Hero.astro`, `Stats.astro`, …) reading the
 * page's entry, and each one stands for one SECTION of the page: a `component` block in its BetterCMS
 * block list, bound to it by `props.bind` (the section's name — `hero`, `stats`, …). So the block list
 * is the page, the way a Sanity page-builder array is: a section moved, added, duplicated or removed in
 * the Visual Editor moves, adds, repeats or drops that component here on the next build, and each one's
 * root carries its block id (`data-bcms-block`) so the editor finds it.
 *
 * - `codeOrder` is every section the page can draw, by name, in the order the design ships. It is the
 *   page as-is when the snapshot has no block list for it (a fresh project, local dev without content),
 *   or when the block list names none of these sections — the page never goes blank.
 * - A block names its section by `bind`, or — a section duplicated in the editor carries no `bind` — by
 *   being another instance of a component that some other block binds.
 * - A block this repo has no component for (a section added from the BetterCMS library) is skipped: the
 *   design has nothing to draw it with. The editor says so on that section's row.
 */
export interface PlacedBlock {
  id?: string;
  type?: string;
  props?: { bind?: unknown; componentId?: unknown; [key: string]: unknown };
  style?: Record<string, unknown> | null;
}

export interface PlannedSection {
  /** The section's name — the slot the page renders it from. */
  bind: string;
  /** The block it renders for, or null where the page follows its own order (no block list). */
  block: PlacedBlock | null;
}

const isComponent = (b: unknown): b is PlacedBlock =>
  typeof b === "object" && b !== null && (b as PlacedBlock).type === "component";

export function sectionPlan(blocks: unknown, codeOrder: readonly string[]): PlannedSection[] {
  const shipped = codeOrder.map((bind) => ({ bind, block: null }));
  const placed = Array.isArray(blocks) ? blocks.filter(isComponent) : [];
  if (placed.length === 0) return shipped;

  const known = new Set(codeOrder);
  const bindOf = (b: PlacedBlock) => (typeof b.props?.bind === "string" && known.has(b.props.bind) ? b.props.bind : null);
  // A duplicated section has no `bind` of its own: it is another instance of the same component.
  const byComponent = new Map<string, string>();
  for (const b of placed) {
    const bind = bindOf(b);
    if (bind && typeof b.props?.componentId === "string") byComponent.set(b.props.componentId, bind);
  }

  const out: PlannedSection[] = [];
  for (const b of placed) {
    const bind = bindOf(b) ?? (typeof b.props?.componentId === "string" ? byComponent.get(b.props.componentId) : undefined);
    if (bind) out.push({ bind, block: b });
  }
  return out.length > 0 ? out : shipped;
}
