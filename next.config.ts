import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` is a native driver — keep it out of the bundler and load it at runtime.
  serverExternalPackages: ["pg"],
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Google account avatars returned by Firebase Auth
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

export default nextConfig;
