import { createClient } from "redis";

export let stats = [];

const redis = createClient()
.on("error", (err) => console.log("Redis failed to connect", err))
.on("ready", () => console.log("Redis connected"))

export const fetchStats = async () => {
    try {
        await redis.connect();
        const pipeline = redis.multi();

        const dates = statsDates();
        for (const date of dates) {
            const key = statsPrefix + date;
            pipeline.hGetAll(key);
        }
    
        const results = await pipeline.exec();
        for (const i in results) {
            const date = dates[i];
            const result = results[i];
    
            if (result && Object.keys(result).length > 0) {
                stats[date] = result;
            }
        }

        console.log("Successfully fetched the stats")
    
    } catch(err) {
        console.log("Failed to fetch the stats: ", err);

    } finally {
        await redis.close();
    }
};

const startDate = "2025-09-16";
const statsPrefix = "stats:";

export const statsDates = () => {
    const keys = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
  
    for (let d = new Date(startDate); d < today; d.setDate(d.getDate() + 1)) {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      keys.push(`${year}-${month}-${day}`);
    }
    
    return keys;
};