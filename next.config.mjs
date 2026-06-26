/** @type {import('next').NextConfig} */
// Static export: BetterCMS hosting serves the build as static files, and the deploy Action fetches
// content into bcms-content.json BEFORE `next build` (no API key at build time). Every page resolves
// from that snapshot → a fully static `out/`.
export default {
  output: "export",
  images: { unoptimized: true },
  // The contact/search/newsletter client components import @betttercms/sdk, which pulls in the SDK's
  // Node-only management client (dns/fs). Those paths never run in the browser, so stub the Node
  // builtins out of the client bundle.
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
