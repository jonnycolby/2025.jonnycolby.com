/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        // removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
        removeConsole: process.env.NODE_ENV == "production",
    },
};

export default nextConfig;
