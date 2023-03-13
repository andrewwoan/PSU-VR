import { defineConfig } from "vite";

export default defineConfig({
    root: "frontend",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    },
    server: {
        proxy: {
            "/foo": "http://localhost:5000",
            "/api": {
                target: "https://localhost:5000",
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
    },
});
