/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'dtvydrk6x',
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'profile-avatars',
  },
};

module.exports = nextConfig;
