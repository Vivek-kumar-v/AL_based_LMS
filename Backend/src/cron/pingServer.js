import cron from "node-cron";
import axios from "axios";

const URL = "https://al-based-lms-2.onrender.com/health";

export const startPingCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const res = await axios.get(URL);
      console.log("✅ Ping Success:", res.data);
    } catch (err) {
      console.log("❌ Ping Failed:", err.message);
    }
  });

  console.log("🚀 Cron Job Started: Pinging server every 5 minutes");
};
