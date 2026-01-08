import { query } from "../config/database.js";

//--------------- User Model ---------------
export const UserModel = {
  /**
   * Find user by userId
   */
  async findById(userId) {
    const text = "SELECT * FROM users WHERE user_id = $1";
    try {
      const result = await query(text, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error finding user:", error);
      throw error;
    }
  },

  /**
   * Add PREMIUM role to user
   */
  async addPremiumRole(userId) {
    try {
      console.log(`🔧 [DEBUG] Checking if user ${userId} has PREMIUM role...`);

      // Check if user already has PREMIUM role
      const checkText = `
        SELECT COUNT(*) as count
        FROM users_roles
        WHERE user_user_id = $1 AND roles_role_name = 'PREMIUM'
      `;
      const checkResult = await query(checkText, [userId]);
      console.log(
        `📊 [DEBUG] Role check result: count=${checkResult.rows[0].count}`
      );

      if (checkResult.rows[0].count > 0) {
        console.log(`ℹ️ User ${userId} already has PREMIUM role`);
        return;
      }

      // Add PREMIUM role
      console.log(`🔧 [DEBUG] Inserting PREMIUM role for user ${userId}...`);
      const insertText = `
        INSERT INTO users_roles (user_user_id, roles_role_name)
        VALUES ($1, 'PREMIUM')
        ON CONFLICT DO NOTHING
      `;
      await query(insertText, [userId]);
      console.log(`✅ Added PREMIUM role to user ${userId}`);

      // Verify role was added
      const verifyResult = await query(checkText, [userId]);
      console.log(
        `✅ [DEBUG] Role verification: count=${verifyResult.rows[0].count}`
      );
    } catch (error) {
      console.error("❌ Error adding PREMIUM role:", error);
      console.error("❌ [DEBUG] Error details:", error.message);
      throw error;
    }
  },

  /**
   * Remove PREMIUM role from user
   */
  async removePremiumRole(userId) {
    try {
      const text = `
        DELETE FROM users_roles
        WHERE user_user_id = $1 AND roles_role_name = 'PREMIUM'
      `;
      const result = await query(text, [userId]);

      if (result.rowCount > 0) {
        console.log(`✅ Removed PREMIUM role from user ${userId}`);
      } else {
        console.log(`ℹ️ User ${userId} didn't have PREMIUM role`);
      }
    } catch (error) {
      console.error("❌ Error removing PREMIUM role:", error);
      throw error;
    }
  },

  /**
   * Update user premium and tokens after payment
   */
  async updatePremiumPlan(userId, productName) {
    console.log(
      `🔧 [DEBUG] Starting updatePremiumPlan for user: ${userId}, product: ${productName}`
    );

    let tokens = 8000;
    let premiumPoints = 0;
    let premiumOneMonth = false;
    let premiumSixMonths = false; // Match database: premium_six_months

    // Determine premium points and flags based on product
    if (productName === "PREMIUM_ONE_MONTH") {
      premiumPoints = 1;
      premiumOneMonth = true;
      console.log(`📌 [DEBUG] Set ONE_MONTH: points=1, flag=true`);
    } else if (productName === "PREMIUM_SIX_MONTH") {
      premiumPoints = 6;
      premiumSixMonths = true; // Match database
      console.log(`📌 [DEBUG] Set SIX_MONTH: points=6, flag=true`);
    }

    const text = `
      UPDATE users 
      SET tokens = $1,
          premium_points = $2,
          premium_one_month = $3,
          premium_six_months = $4,
          last_refill_at = NOW()
      WHERE user_id = $5
      RETURNING *
    `;

    const values = [
      tokens,
      premiumPoints,
      premiumOneMonth,
      premiumSixMonths, // Match database
      userId,
    ];

    console.log(`🔧 [DEBUG] Query values:`, {
      tokens,
      premiumPoints,
      premiumOneMonth,
      premiumSixMonths,
      userId,
    });

    try {
      // Check user data BEFORE update
      const beforeText =
        "SELECT user_id, tokens, premium_points, premium_one_month, premium_six_months FROM users WHERE user_id = $1";
      const beforeResult = await query(beforeText, [userId]);
      console.log(`📊 [DEBUG] BEFORE UPDATE:`, beforeResult.rows[0]);

      console.log(`📝 [DEBUG] Executing UPDATE query...`);
      const result = await query(text, values);
      console.log(
        `✅ [DEBUG] UPDATE successful, affected rows: ${result.rowCount}`
      );

      if (result.rows[0]) {
        console.log(`📊 [DEBUG] AFTER UPDATE (from RETURNING):`, {
          userId: result.rows[0].user_id,
          tokens: result.rows[0].tokens,
          premiumPoints: result.rows[0].premium_points,
          premiumOneMonth: result.rows[0].premium_one_month,
          premiumSixMonths: result.rows[0].premium_six_months,
        });

        // Double check with a fresh SELECT
        const verifyResult = await query(beforeText, [userId]);
        console.log(
          `🔍 [DEBUG] VERIFICATION (fresh SELECT):`,
          verifyResult.rows[0]
        );
      }

      // Add PREMIUM role to user
      console.log(`🔧 [DEBUG] Adding PREMIUM role...`);
      await this.addPremiumRole(userId);
      console.log(`✅ [DEBUG] PREMIUM role added successfully`);

      console.log(
        `🎉 Updated user ${userId} with premium plan: ${productName}`,
        {
          tokens,
          premiumPoints,
          premiumOneMonth,
          premiumSixMonths,
        }
      );
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error updating user premium:", error);
      console.error("❌ [DEBUG] Error details:", error.message);
      console.error("❌ [DEBUG] Error stack:", error.stack);
      throw error;
    }
  },

  /**
   * Get all users with active premium (premium_points > 0)
   */
  async getActivePremiumUsers() {
    const text = `
      SELECT * FROM users 
      WHERE premium_points > 0
    `;

    try {
      const result = await query(text);
      return result.rows;
    } catch (error) {
      console.error("❌ Error getting premium users:", error);
      throw error;
    }
  },

  /**
   * Reset user to normal (non-premium) state
   */
  async resetToNormalUser(userId) {
    try {
      console.log(`🔧 [DEBUG] Resetting user ${userId} to normal state...`);

      const text = `
        UPDATE users
        SET tokens = 1000,
            premium_points = 0,
            premium_one_month = false,
            premium_six_months = false
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await query(text, [userId]);
      console.log(
        `✅ [DEBUG] User reset successful, affected rows: ${result.rowCount}`
      );

      // Remove PREMIUM role
      console.log(`🔧 [DEBUG] Removing PREMIUM role...`);
      await this.removePremiumRole(userId);

      console.log(`🔄 Reset user ${userId} to normal state: tokens=1000`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error resetting user to normal:", error);
      throw error;
    }
  },

  /**
   * Check and refill tokens for users whose last refill was 1 month ago
   * Premium users: 8000 tokens
   * Normal users: 1000 tokens
   */
  async autoRefillMonthlyTokens() {
    // Refill for premium users (8000 tokens)
    const premiumText = `
      UPDATE users
      SET tokens = 8000,
          premium_points = premium_points - 1,
          premium_one_month = CASE WHEN premium_points - 1 <= 0 THEN false ELSE premium_one_month END,
          premium_six_months = CASE WHEN premium_points - 1 <= 0 THEN false ELSE premium_six_months END,
          last_refill_at = NOW()
      WHERE premium_points > 0
        AND last_refill_at <= NOW() - INTERVAL '1 month'
      RETURNING user_id, username, tokens, premium_points, premium_one_month, premium_six_months, last_refill_at
    `;

    // Refill for normal users (1000 tokens)
    const normalText = `
      UPDATE users
      SET tokens = 1000,
          last_refill_at = NOW()
      WHERE premium_points = 0
        AND last_refill_at <= NOW() - INTERVAL '1 month'
      RETURNING user_id, username, tokens, premium_points, last_refill_at
    `;

    try {
      // Refill premium users
      const premiumResult = await query(premiumText);

      if (premiumResult.rowCount > 0) {
        console.log(`🌟 Auto-refilled ${premiumResult.rowCount} premium users`);

        for (const user of premiumResult.rows) {
          console.log(
            `  ✅ Premium user ${user.user_id}: tokens=8000, premiumPoints=${user.premium_points}`
          );

          // If premium expired, reset to normal user
          if (user.premium_points === 0) {
            await this.resetToNormalUser(user.user_id);
            console.log(
              `  ⏰ Premium expired for user ${user.user_id} - Reset to normal (tokens=1000)`
            );
          }
        }
      }

      // Refill normal users
      const normalResult = await query(normalText);

      if (normalResult.rowCount > 0) {
        console.log(`👤 Auto-refilled ${normalResult.rowCount} normal users`);
        normalResult.rows.forEach((user) => {
          console.log(`  ✅ Normal user ${user.user_id}: tokens=1000`);
        });
      }

      if (premiumResult.rowCount === 0 && normalResult.rowCount === 0) {
        console.log("ℹ️ No users need token refill at this time");
      }

      return {
        premiumUsers: premiumResult.rows,
        normalUsers: normalResult.rows,
        totalUpdated: premiumResult.rowCount + normalResult.rowCount,
      };
    } catch (error) {
      console.error("❌ Error auto-refilling tokens:", error);
      throw error;
    }
  },

  /**
   * Get user statistics
   */
  async getStats() {
    const text = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN premium_points > 0 THEN 1 END) as premium_users,
        SUM(tokens) as total_tokens,
        AVG(tokens) as avg_tokens
      FROM users
    `;

    try {
      const result = await query(text);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error getting user stats:", error);
      throw error;
    }
  },

  /**
   * Cleanup expired premium users (reset to normal state)
   */
  async cleanupExpiredPremiumUsers() {
    try {
      // Find users with premium_points = 0 but still have PREMIUM role or premium flags
      const findText = `
        SELECT DISTINCT u.user_id, u.username, u.tokens, u.premium_points
        FROM users u
        LEFT JOIN users_roles ur ON u.user_id = ur.user_user_id AND ur.roles_role_name = 'PREMIUM'
        WHERE u.premium_points = 0 
          AND (ur.roles_role_name IS NOT NULL 
               OR u.premium_one_month = true 
               OR u.premium_six_months = true)
      `;

      const result = await query(findText);

      if (result.rowCount > 0) {
        console.log(
          `🧹 Cleaning up ${result.rowCount} expired premium users...`
        );

        for (const user of result.rows) {
          // Reset to normal user (tokens=1000, remove role, clear flags)
          await this.resetToNormalUser(user.user_id);
          console.log(
            `  ✅ Reset ${user.username} (${user.user_id}) to normal state`
          );
        }

        console.log(`✅ Cleanup completed: ${result.rowCount} users processed`);
      } else {
        console.log("ℹ️ No expired premium users to cleanup");
      }

      return result.rows;
    } catch (error) {
      console.error("❌ Error cleaning up expired premium users:", error);
      throw error;
    }
  },
};

export default UserModel;
