/**
 * Vite configuration for Evangadi Forum frontend
 * Production Summary: Configures Vite for fast development and production builds with React and API proxying.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure this matches Netlify's expected directory
    emptyOutDir: true, // Cleans the directory before building
  },
  server: {
    port: 5000,
  },
});
