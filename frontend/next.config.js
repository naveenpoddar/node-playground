/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: process.env.SERVER_URL,
    WS_URI: process.env.WS_URI,
  },
};

module.exports = nextConfig;
