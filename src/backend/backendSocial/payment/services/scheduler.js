import cron from "node-cron";
import UserModel from "../models/UserModel.js";

//--------------- Cron Job Scheduler ---------------

export function startScheduler() {
  console.log("🕐 Starting scheduler...");

  const dailyRefillJob = cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🔄 Running daily token refill check...");
      try {
        // Refill tokens for all users (premium: 8000, normal: 1000)
        const result = await UserModel.autoRefillMonthlyTokens();
        console.log(
          `✅ Daily refill completed: ${result.totalUpdated} users updated (${result.premiumUsers.length} premium, ${result.normalUsers.length} normal)`
        );

        // Cleanup expired premium users (reset to normal state)
        await UserModel.cleanupExpiredPremiumUsers();
      } catch (error) {
        console.error("❌ Error in daily refill job:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh", // Vietnam timezone
    }
  );

  console.log("✅ Scheduler started successfully");
  console.log("📅 Daily token refill job: Every day at 00:00 (Vietnam time)");

  return {
    dailyRefillJob,
    // hourlyRefillJob, // if enabled
  };
}

export function stopScheduler(jobs) {
  console.log("🛑 Stopping scheduler...");
  if (jobs.dailyRefillJob) {
    jobs.dailyRefillJob.stop();
  }

  console.log("✅ Scheduler stopped");
}

export async function manualRefillTrigger() {
  console.log("🔧 Manual refill trigger activated...");
  try {
    const result = await UserModel.autoRefillMonthlyTokens();
    await UserModel.cleanupExpiredPremiumUsers();

    console.log(
      `✅ Manual refill completed: ${result.totalUpdated} users updated`
    );
    console.log(`  🌟 Premium users: ${result.premiumUsers.length}`);
    console.log(`  👤 Normal users: ${result.normalUsers.length}`);

    return {
      success: true,
      totalUpdated: result.totalUpdated,
      premiumUsers: result.premiumUsers,
      normalUsers: result.normalUsers,
    };
  } catch (error) {
    console.error("❌ Error in manual refill:", error);
    throw error;
  }
}

/**
 * Manual cleanup trigger for testing
 */
export async function manualCleanupTrigger() {
  console.log("🧹 Manual cleanup trigger activated...");
  try {
    const cleanedUsers = await UserModel.cleanupExpiredPremiumUsers();
    console.log(
      `✅ Manual cleanup completed: ${cleanedUsers.length} users processed`
    );
    return {
      success: true,
      usersProcessed: cleanedUsers.length,
      users: cleanedUsers,
    };
  } catch (error) {
    console.error("❌ Error in manual cleanup:", error);
    throw error;
  }
}

export default {
  startScheduler,
  stopScheduler,
  manualRefillTrigger,
  manualCleanupTrigger,
};
