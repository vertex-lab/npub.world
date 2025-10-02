import { createClient } from "redis";

export let stats = [];

export const contentKinds = [ 1, 20, 21, 22, 1111, 30023 ];
export const engagementKinds = [ 6, 7, 16, 9321, 9735 ];
export const profileKinds = [ 0, 3, 10000, 10002, 10063 ]; 
export const kinds = [ ...contentKinds, ...engagementKinds,  ...profileKinds ];

const redis = createClient({
    url: "redis://" + process.env.REDIS_ADDRESS,
});

export const fetchStats = async () => {
    try {
        await redis.connect();

        const start = startDate();
        const dates = statsDates(start);
        if (!dates || dates.length === 0) return

        const pipeline = redis.multi();
        for (const date of dates) {
            const key = "stats:" + date;
            pipeline.hGetAll(key);
        }
    
        const results = await pipeline.exec();
        for (const i in results) {
            const date = dates[i];
            const result = results[i];
    
            if (result && Object.keys(result).length > 0) {
                stats.push({ date: date, ...result });
            }
        }

        const message = dates.length > 1
        ? `Successfully fetched the stats from ${dates[0]} to ${dates[dates.length - 1]}`
        : `Successfully fetched the stats for ${dates[0]}`;
        console.log(message);
    
    } catch(err) {
        console.log("Failed to fetch the stats: ", err);

    } finally {
        await redis.close();
    }
};

const firstRecording = "2025-09-16";

const startDate = () => {
    if (!stats || stats.length === 0) {
        return firstRecording;
    }

    const last = new Date(stats[stats.length - 1].date);
    last.setDate(last.getDate() + 1); // move to the next day
    return last;
};

/**
 * Generates an array of date strings (YYYY-MM-DD) from the given start date
 * up to yesterday (exclusive of today). These strings are used as Redis keys
 * to fetch stats for each day.
 * 
 * @param {Date} start - The starting date for which to generate stats keys.
 * @returns {string[]} - An array of date strings in YYYY-MM-DD format.
 */
export const statsDates = (start) => {
    const dates = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
  
    for (let d = new Date(start); d < today; d.setDate(d.getDate() + 1)) {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    
    return dates;
};