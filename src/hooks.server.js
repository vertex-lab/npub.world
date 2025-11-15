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

const RIGHT_AFTER_MIDNIGHT = "1 0 * * *"  // 00:01 UTC every day
const EVERY_SECOND = "* * * * * *"  // for testing only

const initializeServices = async () => {
  try {
    await relay.connect();
    console.log("Relay connected");

    await fetchStats();
    statsCron = cron.schedule(
      RIGHT_AFTER_MIDNIGHT,
      fetchStats,
      { 
        timezone: "UTC",
        recoverMissedExecutions: true
      },
    );

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