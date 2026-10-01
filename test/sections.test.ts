/**
 * The page's BetterCMS block list decides which sections render and in what order — what lets the
 * Visual Editor add, move, swap and remove sections on this site.
 */
import { describe, expect, it } from "vitest";
import { sectionPlan } from "../lib/sections";

const HOME = ["hero", "stats", "features", "logos", "testimonials", "cta"];
const block = (id: string, bind?: string, componentId = `c_${bind ?? id}`) => ({ id, type: "component", props: { ...(bind ? { bind } : {}), componentId } });
const order = (plan: ReturnType<typeof sectionPlan>) => plan.map((s) => `${s.bind}:${s.block?.id ?? "-"}`);

describe("sectionPlan", () => {
  it("no block list: the design's own order, nothing stamped", () => {
    expect(order(sectionPlan(undefined, HOME))).toEqual(HOME.map((b) => `${b}:-`));
  });

  it("the block list's order wins, and a removed section is gone", () => {
    expect(order(sectionPlan([block("1", "hero"), block("2", "cta"), block("3", "stats")], HOME))).toEqual(["hero:1", "cta:2", "stats:3"]);
  });

  it("a section duplicated in the editor (no bind, same component) renders again with its own id", () => {
    expect(order(sectionPlan([block("1", "hero"), block("2", "stats"), block("3", undefined, "c_stats")], HOME))).toEqual(["hero:1", "stats:2", "stats:3"]);
  });

  it("a section this design has no component for is skipped; a list of only those keeps the page", () => {
    expect(order(sectionPlan([block("1", "hero"), block("x", undefined, "c_library")], HOME))).toEqual(["hero:1"]);
    expect(order(sectionPlan([block("x", undefined, "c_library")], HOME))).toEqual(HOME.map((b) => `${b}:-`));
  });
});
