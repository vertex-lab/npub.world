import { relay } from "./lib/nostr.js";
import { fetchStats } from "./lib/stats.server";
import { imagesPath } from "./lib/profile.js"
import { mkdir } from "node:fs/promises";
import cron from "node-cron";

// Handle requests
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
};

let statsCron;

const initializeServices = async () => {
  try {
    await relay.connect();
    console.log("Relay connected");

    await fetchStats();
    statsCron = cron.schedule("1 0 * * *",fetchStats,{ timezone: "UTC"});   // 00:01 UTC every day

    await mkdir(imagesPath, { recursive: true });
    console.log("Ensured directory %s exists", imagesPath);

  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1);
  }
};

await initializeServices();

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM");
  await relay.close();
  await statsCron.stop();
  process.exit(0);
});