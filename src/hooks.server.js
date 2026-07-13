import { relay } from "./lib/nostr.js";
import { fetchStats } from "./lib/stats.server";
import { imager } from "./lib/image.js";
import { ranker, isNetworkError } from "./lib/open-ranking.js";
import { getAuth } from "./lib/auth.server.js";
import { getSettings } from "./lib/settings.server.js";
import cron from "node-cron";

// Handle requests
export const handle = async ({ event, resolve }) => {
  const { pubkey, nwt } = getAuth(event.cookies);
  const { provider, algorithms } = getSettings(event.cookies);
  event.locals.pubkey      = pubkey;
  event.locals.nwt         = nwt;
  event.locals.provider    = provider;
  event.locals.algorithms  = algorithms;
  event.locals.clientIP    = event.getClientAddress();
  try {
    event.locals.capabilities = await ranker.capabilities(provider);
  } catch (err) {
    if (!isNetworkError(err)) console.error('Failed to fetch provider capabilities:', err);
    event.locals.capabilities = null;
  }

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

    await imager.init();
    await ranker.init();

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
