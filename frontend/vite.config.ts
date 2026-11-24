import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias @/ -> src/ (el mismo alias se declara en tsconfig.app.json)
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
