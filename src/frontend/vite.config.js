import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  server: {
    allowedHosts: [
      ".ngrok-free.dev",
      ".ngrok.io",
      "3.26.198.240:",
      "nmcnpm.lethanhcong.site",
      "https://tashia-rude-subcortically.ngrok-free.dev",
    ],
    host: true,
  },
});
