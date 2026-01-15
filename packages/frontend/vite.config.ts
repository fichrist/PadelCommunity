import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
    https: fs.existsSync('./localhost+4.pem') ? {
      key: fs.readFileSync('./localhost+4-key.pem'),
      cert: fs.readFileSync('./localhost+4.pem'),
    } : undefined,
    allowedHosts: [
      "localhost",
      ".local",  // Alle *.local domains
      "192.168.50.57",  // Je specifieke IP
      "padelcommunity.duckdns.org"
    ],
  },
  plugins: [
    react(),
    ...(mode === 'development' ? [componentTagger()] : []),
  ] as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
