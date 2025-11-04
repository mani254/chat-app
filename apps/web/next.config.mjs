/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],

  images: {
    domains: ['pub-321aac628169468cb9a4b077e81667e7.r2.dev'],
  },
  
}

export default nextConfig
