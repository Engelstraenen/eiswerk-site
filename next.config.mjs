/** @type {import('next').NextConfig} */
// Statischer Export fuer GitHub Pages: STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/eiswerk-site pnpm build
const staticExport = process.env.STATIC_EXPORT === "1";
const nextConfig = {
  reactStrictMode: false,
  ...(staticExport ? { output: "export", basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "", images: { unoptimized: true }, trailingSlash: true } : {}),
};
export default nextConfig;
