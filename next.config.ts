import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "sharp",
    "@prisma/client",
    "bcryptjs",
    "@tensorflow/tfjs",
    "@tensorflow-models/blazeface",
  ],
};

export default nextConfig;
