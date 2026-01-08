import Stripe from "stripe";
import UserModel from "../models/UserModel.js";

//--------------- Stripe Initialization ---------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const successUrl = process.env.SUCCESS_URL;
const cancelUrl = process.env.CANCEL_URL;

//--------------- Payment Functions ---------------
export async function createPayment(req, res) {
  try {
    const {
      userId,
      productName,
      amount,
      description,
      image,
      email,
      price,
      currency,
      quantity,
    } = req.body;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "alipay", "link"],
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            unit_amount: price,
            product_data: {
              name: productName,
              description: description,
              images: [image],
              metadata: {
                internalProductId: "P001",
                category: "Premium",
              },
            },
          },
          quantity: quantity || 1,
        },
      ],
      client_reference_id: userId,
      metadata: {
        userId: userId,
        productName: productName,
        description: description,
      },

      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
    });

    console.log("✅ Payment session created:", {
      sessionId: session.id,
      userId: userId,
      productName: productName,
    });

    res.status(200).json({
      code: 200,
      message: "Payment session created successfully",
      result: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("❌ Error creating payment:", error);
    res.status(500).json({
      code: 500,
      message: "Failed to create payment session",
      error: error.message,
    });
  }
}

export async function callback(req, res) {
  const signature = req.headers["stripe-signature"];

  // Check if signature exists
  if (!signature) {
    console.error("❌ No stripe-signature header found");
    return res.status(400).json({ error: "No stripe-signature header" });
  }

  let event;

  try {
    // req.body is raw Buffer when using express.raw()
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).json({
      code: 1400,
      error: "Webhook signature verification failed.",
      message: err.message,
    });
  }

  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("🔔 Checkout session completed:", {
        sessionId: session.id,
        metadata: session.metadata,
        client_reference_id: session.client_reference_id,
        payment_status: session.payment_status,
      });

      try {
        // Get userId and productName from session metadata
        const userId = session.metadata?.userId || session.client_reference_id;
        const productName = session.metadata?.productName;

        console.log("📝 Extracted data:", { userId, productName });

        if (userId && productName) {
          // Check if it's a premium product
          if (
            productName === "PREMIUM_ONE_MONTH" ||
            productName === "PREMIUM_SIX_MONTH"
          ) {
            console.log(`🔄 Updating user ${userId} with ${productName}...`);

            // Update user's premium plan and tokens
            const updatedUser = await UserModel.updatePremiumPlan(
              userId,
              productName
            );

            console.log("🎉 Premium plan activated for user:", {
              userId: updatedUser.user_id,
              tokens: updatedUser.tokens,
              premiumPoints: updatedUser.premium_points,
              lastRefillAt: updatedUser.last_refill_at,
            });
          } else {
            console.log(`ℹ️ Not a premium product: ${productName}`);
          }
        } else {
          console.warn(
            "⚠️ Missing userId or productName in session metadata:",
            {
              userId,
              productName,
              metadata: session.metadata,
              client_reference_id: session.client_reference_id,
            }
          );
        }
      } catch (error) {
        console.error("❌ Error updating payment status:", error);
        console.error("❌ Error stack:", error.stack);
      }
      break;

    case "checkout.session.expired":
      console.log("⏰ Payment session expired:", event.data.object.id);
      break;

    // These events are handled automatically by Stripe, just acknowledge
    case "charge.succeeded":
    case "charge.updated":
    case "payment_intent.created":
    case "payment_intent.succeeded":
      // Silently acknowledge - these are handled by checkout.session.completed
      break;

    default:
      // Log unknown events for debugging
      console.log(`ℹ️ Received event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
}
