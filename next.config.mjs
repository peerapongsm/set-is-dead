/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const nextConfig = {
  output: "export",            // pure static site → GitHub Pages
  images: { unoptimized: true },
  basePath,
  trailingSlash: true,         // friendlier static hosting
};
export default nextConfig;
