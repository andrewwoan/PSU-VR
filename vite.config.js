import { defineConfig } from "vite";

export default defineConfig({
    root: "frontend",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    },
    optimizeDeps: {
        include: ["socket.io-client"],
    },
    server: {
        proxy: {
            "/foo": "http://localhost:3000",
            "/api": {
                target: "https://localhost:3000",
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
    },
});
