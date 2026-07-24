/** @type {import('next').NextConfig} */

// GitHub Pages serves the app from https://<user>.github.io/<repo>/, so the
// static export needs a base path. Local `npm run dev` / `npm start` stay at
// the root — the flag is only set by `npm run build:pages`.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = "/scoutiq";

const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: "export",
        basePath,
        assetPrefix: `${basePath}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
