/** @type {import('next').NextConfig} */
// Static export: BetterCMS hosting serves the build as static files, and the deploy Action fetches
// content into bcms-content.json BEFORE `next build` (no API key at build time). Every page resolves
// from that snapshot → a fully static `out/`.
export default {
  output: "export",
  images: { unoptimized: true },
  // `npm run build:bcms` (what BetterCMS builds with) skips Next's type check: a deploy needs the
  // site, not the check, and `npm run build` — what CI and you run — still type-checks everything.
  typescript: { ignoreBuildErrors: process.env.BCMS_SKIP_TYPECHECK === "1" },
  // The contact/search/newsletter client components import @bettercms-ai/sdk, which pulls in the SDK's
  // Node-only management client (dns/fs). Those paths never run in the browser, so stub the Node
  // builtins out of the client bundle.
  // BOTH bundlers are configured on purpose. Next 16 turned Turbopack on by default and HARD
  // ERRORS on a `webpack` config with no `turbopack` config, so the two must be kept in step:
  // `turbopack` is what `next build` uses now, `webpack` is what `next build --webpack` still
  // uses. Turbopack has no `resolve.fallback: { x: false }`, so "resolve to nothing" is spelled
  // as an alias to an empty module, scoped to the `browser` condition so the server build keeps
  // the real modules. In practice only the `*/promises` specifiers fail to resolve without this;
  // the rest are listed to mirror the webpack set exactly, so the two cannot silently diverge.
  turbopack: {
    resolveAlias: {
      fs: { browser: "./lib/empty-module.js" },
      "fs/promises": { browser: "./lib/empty-module.js" },
      dns: { browser: "./lib/empty-module.js" },
      "dns/promises": { browser: "./lib/empty-module.js" },
      net: { browser: "./lib/empty-module.js" },
      tls: { browser: "./lib/empty-module.js" },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, "fs/promises": false, dns: false, "dns/promises": false, net: false, tls: false,
      };
    }
    return config;
  },
};
