/**
 * FLO-95 — end-to-end validation of the BetterCMS headless chain against a LIVE API:
 *   define model + reference field → create entries → publish → fetch via delivery
 *   → assert the Author reference is hydrated at depth=1 → render shape is usable.
 *
 * Self-provisioning + self-cleaning: it creates a Blog Post model with an `author`
 * reference, an Author, and a Post, then deletes them all in afterAll. Runs only when
 * the three env vars are set, so a credential-less `vitest run` is a no-op rather than
 * a red gate.
 *
 *   BETTERCMS_API_URL    e.g. https://api.bettercms.ai
 *   BETTERCMS_WORKSPACE  workspace slug (the delivery namespace)
 *   BETTERCMS_MGMT_KEY   an API key with content:manage (provisions + cleans up)
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { BetterCMSManagementClient } from "@betttercms/sdk";

const API_URL = process.env.BETTERCMS_API_URL ?? "https://api.bettercms.ai";
const WORKSPACE = process.env.BETTERCMS_WORKSPACE;
const MGMT_KEY = process.env.BETTERCMS_MGMT_KEY;
const run = WORKSPACE && MGMT_KEY ? describe : describe.skip;

const suffix = `${Date.now().toString(36)}`;
const authorSlug = `qa-author-${suffix}`;
const postSlug = `qa-post-${suffix}`;

run("headless chain: reference hydration over the delivery API", () => {
  const mgmt = new BetterCMSManagementClient({ baseUrl: API_URL, apiKey: MGMT_KEY! });
  const created: { models: string[]; entries: string[] } = { models: [], entries: [] };

  let authorModelId: string;
  let blogModelId: string;
  let authorEntryId: string;

  beforeAll(async () => {
    // 1. Author model.
    const author = await mgmt.createModel({
      name: `QA Author ${suffix}`,
      slug: `qa-author-model-${suffix}`,
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "bio", label: "Bio", type: "text" },
      ],
    });
    authorModelId = author.id;
    created.models.push(author.id);

    // 2. Blog Post model with a reference field pointing at the Author model.
    const blog = await mgmt.createModel({
      name: `QA Blog Post ${suffix}`,
      slug: `qa-blog-model-${suffix}`,
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "author", label: "Author", type: "reference", config: { contentModelId: author.id } },
      ],
    });
    blogModelId = blog.id;
    created.models.push(blog.id);

    // 3. Publish an Author, then a Post that references it.
    const authorEntry = await mgmt.createEntry({
      contentModelId: authorModelId,
      slug: authorSlug,
      status: "published",
      data: { name: "Jane Doe", bio: "Staff writer" },
    });
    authorEntryId = authorEntry.id;
    created.entries.push(authorEntry.id);

    const postEntry = await mgmt.createEntry({
      contentModelId: blogModelId,
      slug: postSlug,
      status: "published",
      data: { title: "Hello World", author: authorEntry.id },
    });
    created.entries.push(postEntry.id);
  }, 60_000);

  afterAll(async () => {
    // Best-effort teardown — leave no residue on the live workspace.
    for (const id of created.entries) await mgmt.deleteEntry(id).catch(() => {});
    for (const id of created.models) await mgmt.deleteModel(id).catch(() => {});
  }, 60_000);

  it("hydrates the Author reference at depth=1", async () => {
    const url = `${API_URL}/api/v1/delivery/${WORKSPACE}/content-entries/${postSlug}?depth=1`;
    const res = await fetch(url);
    expect(res.status, await res.text().catch(() => "")).toBe(200);

    const { data } = (await res.json()) as { data: { title: string; author: unknown } };
    expect(data.title).toBe("Hello World");

    // The crux: `author` must be the HYDRATED entry object, not a bare id string.
    expect(typeof data.author).toBe("object");
    const author = data.author as { id: string; slug: string; data: { name: string; bio?: string } };
    expect(author.id).toBe(authorEntryId);
    expect(author.slug).toBe(authorSlug);
    expect(author.data.name).toBe("Jane Doe");
    expect(author.data.bio).toBe("Staff writer");
  });

  it("returns the raw reference id at depth=0 (no hydration)", async () => {
    const url = `${API_URL}/api/v1/delivery/${WORKSPACE}/content-entries/${postSlug}?depth=0`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { author: unknown } };
    // depth=0 → the reference is the id (string) or a {entryId} ref, never a full entry.
    const isRaw =
      typeof data.author === "string" ||
      (typeof data.author === "object" && data.author !== null && "entryId" in (data.author as object));
    expect(isRaw).toBe(true);
  });
});
