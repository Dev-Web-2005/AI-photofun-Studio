import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { authenticate } from "./middleware/authentication.js";
import { createPayment, callback } from "./functional/payment.js";
import {
  startScheduler,
  manualRefillTrigger,
  manualCleanupTrigger,
} from "./services/scheduler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Check if running behind api-gateway (no CORS needed) or standalone
const ENABLE_CORS = process.env.ENABLE_CORS !== "false";

//--------------- Start Scheduler ---------------
const schedulerJobs = startScheduler();

//--------------- Webhook Endpoint (MUST be before other middleware) ---------------
// Stripe webhook cần raw body, không parse JSON
app.post(
  "/payment/callback",
  express.raw({ type: "application/json" }),
  callback
);

//--------------- Middleware Setup ---------------
// Only enable CORS if not behind api-gateway to avoid double CORS headers
if (ENABLE_CORS) {
  app.use(cors());
  console.log("✅ CORS enabled (standalone mode)");
} else {
  console.log("ℹ️ CORS disabled (behind api-gateway)");
}
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.head("/health", (req, res) => {
  res.sendStatus(200);
});

// Apply authentication to all routes below
app.use(authenticate);

//--------------- Routes ---------------

app.post("/payment/create-payment", createPayment);

// Manual refill trigger (for testing/admin)
app.post("/payment/manual-refill", async (req, res) => {
  try {
    const result = await manualRefillTrigger();
    res.status(200).json({
      code: 200,
      message: "Manual refill completed",
      result: result,
    });
  } catch (error) {
    console.error("❌ Manual refill error:", error);
    res.status(500).json({
      code: 500,
      message: "Failed to execute manual refill",
      error: error.message,
    });
  }
});

// Manual cleanup expired premium trigger (for testing/admin)
app.post("/payment/manual-cleanup", async (req, res) => {
  try {
    const result = await manualCleanupTrigger();
    res.status(200).json({
      code: 200,
      message: "Manual cleanup completed",
      result: result,
    });
  } catch (error) {
    console.error("❌ Manual cleanup error:", error);
    res.status(500).json({
      code: 500,
      message: "Failed to execute manual cleanup",
      error: error.message,
    });
  }
});

//--------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//--------------- DONE ---------------
