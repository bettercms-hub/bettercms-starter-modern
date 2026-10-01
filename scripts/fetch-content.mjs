/**
 * Build snapshot: write `bcms-content.json` (entries grouped into `collections` by model slug, plus
 * forms) — the same shape the BetterCMS deploy Action generates on every publish. The static
 * (`output: export`) build reads this, so run it before `npm run dev` / `npm run build`.
 *
 *   BETTERCMS_API_URL=… BETTERCMS_WORKSPACE=… BETTERCMS_API_KEY=… node scripts/fetch-content.mjs
 */
import { writeFile } from "node:fs/promises";

const apiUrl = process.env.BETTERCMS_API_URL ?? "https://api.bettercms.ai";
const workspace = process.env.BETTERCMS_WORKSPACE;
const apiKey = process.env.BETTERCMS_API_KEY;
if (!workspace || !apiKey) {
  console.error("Set BETTERCMS_WORKSPACE and BETTERCMS_API_KEY (see .env.example).");
  process.exit(1);
}

const get = async (path) => {
  const res = await fetch(`${apiUrl}/api/v1/delivery/${workspace}/${path}`, { headers: { "X-API-Key": apiKey } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return (await res.json())?.data ?? null;
};

// Every published page, for its ordered section blocks (the order the Visual Editor sets).
const getPages = async () => {
  const items = [];
  for (let page = 1, total = 1; page <= total; page++) {
    const data = await get(`pages?page=${page}&perPage=100`);
    if (!data) break;
    items.push(...(data.items ?? []));
    total = data.totalPages ?? 1;
  }
  return items;
};

const [entries, forms, pages] = await Promise.all([
  get("content-entries?perPage=200&depth=1"),
  get("forms"),
  getPages(),
]);

// Group entries by model slug → `collections` (matches the deploy Action's snapshot). Singletons
// (site/home/about/contact) land in a one-element array under their slug.
const collections = {};
for (const e of entries?.items ?? []) {
  const model = e?._meta?.modelSlug ?? "unknown";
  (collections[model] ??= []).push(e);
}

// Project id powers public site search (?project=…). The deploy Action injects BCMS_PROJECT_ID;
// fall back to the projectId the delivery API returns on the entries response. Null → search disabled.
const projectId = process.env.BCMS_PROJECT_ID ?? entries?.projectId ?? null;

const snapshot = {
  $schema: "bcms-content/v1",
  workspace,
  projectId,
  collections,
  forms: forms?.items ?? [],
  pages,
  turnstileSiteKey: forms?.turnstileSiteKey ?? null,
};
await writeFile("bcms-content.json", JSON.stringify(snapshot, null, 2));
const counts = Object.entries(collections).map(([m, v]) => `${v.length} ${m}`).join(", ");
console.log(`Wrote bcms-content.json: ${snapshot.forms.length} form(s), project ${projectId ?? "—"}, entries [${counts}].`);
