/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",            // pure static site → GitHub Pages
  images: { unoptimized: true },
  trailingSlash: true,         // friendlier static hosting
};
export default nextConfig;
