/** Pure accessor self-check: the shapes the components rely on (zoned arrays, hydrated refs). */
import { describe, it, expect } from "vitest";
import { ctaButton, items, refData, refList, type Author } from "../lib/cms";

describe("cms accessors", () => {
  it("unwraps a zoned-repeatable array field", () => {
    expect(items<{ x: number }>({ repeatable: [{ x: 1 }, { x: 2 }] })).toHaveLength(2);
    expect(items(undefined)).toEqual([]);
    expect(items({})).toEqual([]);
  });

  it("resolves a single hydrated reference (and ignores bare ids)", () => {
    expect(refData<Author>({ slug: "a", data: { name: "Maya" } })?.name).toBe("Maya");
    expect(refData<Author>("bare-id")).toBeNull();
    expect(refData<Author>(undefined)).toBeNull();
  });

  it("resolves a hydrated multi-reference list, dropping un-hydrated ids", () => {
    const team = refList<Author>([
      { slug: "a", data: { name: "Maya" } },
      "unhydrated-id" as unknown as { slug: string; data?: Author },
      { slug: "b", data: { name: "Leo" } },
    ]);
    expect(team.map((m) => m.name)).toEqual(["Maya", "Leo"]);
    expect(refList<Author>(undefined)).toEqual([]);
  });
});

/**
 * A call to action is one `button` field, rendered with <BcmsButton>, and a site seeded before the
 * field existed keeps its buttons: `ctaButton` falls back to the flat label + link pair.
 */
describe("ctaButton", () => {
  it("prefers the button field, with the drawn look where none was picked", () => {
    expect(ctaButton({ label: "Start", href: "/contact" }, "Old", "/old", { arrow: true })).toEqual({ arrow: true, label: "Start", href: "/contact" });
    expect(ctaButton({ label: "Start", href: "/contact", variant: "dark", arrow: false }, undefined, undefined, { arrow: true })).toEqual({ arrow: false, label: "Start", href: "/contact", variant: "dark" });
  });

  it("falls back to the old pair when the button field is empty", () => {
    expect(ctaButton(undefined, "Start a project", "/contact", { arrow: true })).toEqual({ arrow: true, label: "Start a project", href: "/contact" });
    expect(ctaButton({ label: "", href: "" }, "See our work", "/case-studies", { variant: "outline" })).toEqual({ variant: "outline", label: "See our work", href: "/case-studies" });
  });

  it("is null without both words and a link", () => {
    expect(ctaButton(undefined, "Start", undefined)).toBeNull();
  });
});
