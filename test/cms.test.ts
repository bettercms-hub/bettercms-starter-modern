/** Pure accessor self-check: the shapes the components rely on (zoned arrays, hydrated refs). */
import { describe, it, expect } from "vitest";
import { items, refData, refList, type Author } from "../lib/cms";

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
