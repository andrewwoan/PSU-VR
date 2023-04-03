import { defineConfig } from "vite";

export default defineConfig({
    root: "frontend",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id
                            .toString()
                            .split("node_modules/")[1]
                            .split("/")[0]
                            .toString();
                    }
                },
            },
        },
    },
    optimizeDeps: {
        include: ["socket.io-client"],
    },
});
