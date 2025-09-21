import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: path.resolve(__dirname, 'client/index.html'),
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'wouter',
            '@tanstack/react-query',
          ],
          'ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ]
        }
      }
    },
  },
  base: '/',
  resolve: {
    alias: {
      // Base src folder alias
      "@": path.resolve(__dirname, "client/src"),

      // Components folder
      "@components": path.resolve(__dirname, "client/src/components"),

      // UI components
      "@ui": path.resolve(__dirname, "client/src/components/ui"),

      // Shared utilities or constants
      "@shared": path.resolve(__dirname, "client/src/shared"),

      // Assets (images, icons, etc.)
      "@assets": path.resolve(__dirname, "client/src/attached_assets"),
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
