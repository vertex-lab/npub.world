import { relay } from "./lib/nostr.js";
import { fetchStats } from "./lib/stats.server";
import { imagesPath } from "./lib/profile.js"
import { mkdir } from "node:fs/promises";

// Handle requests
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
};

const initializeServices = async () => {
  try {
    await relay.connect();
    console.log("Relay connected");

    await fetchStats();

    await mkdir(imagesPath, { recursive: true });
    console.log("Ensured directory %s exists", imagesPath);

  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1);
  }
};

initializeServices();

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM");
  await relay.close();
  process.exit(0);
});