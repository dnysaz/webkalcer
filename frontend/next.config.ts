import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output mandiri: `next build` menghasilkan .next/standalone (server.js +
  // node_modules minimal) sehingga VPS tidak perlu `npm install` saat runtime.
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
