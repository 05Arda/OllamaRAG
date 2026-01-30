import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    // LanceDB'nin önceden optimize edilmesini (bundling) engelle
    exclude: ["@lancedb/lancedb"],
  },
  build: {
    rollupOptions: {
      // Build aşamasında bu modülü dışarıda (external) tut
      external: [/^@lancedb\/lancedb.*/],
    },
  },
});
