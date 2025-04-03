import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["88ee-102-89-82-42.ngrok-free.app"], // Add your Ngrok host here
    host: "0.0.0.0", // Ensure the server listens to all network interfaces
  },
});
