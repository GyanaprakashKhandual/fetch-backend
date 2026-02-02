import app, { connectDB } from "./app";
import { config } from "dotenv";

// Load environment variables
config();

// Server configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log("🚀 Server is running!");
      console.log("=".repeat(50));
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log("=".repeat(50) + "\n");

      console.log("📋 Available Endpoints:");
      console.log("├─ GET  /                          - API status");
      console.log("├─ GET  /health                    - Health check");
      console.log("├─ POST /api/auth/register         - Register user");
      console.log("├─ POST /api/auth/verify-email     - Verify email OTP");
      console.log("├─ POST /api/auth/resend-otp       - Resend OTP");
      console.log("├─ POST /api/auth/login            - Login user");
      console.log("├─ POST /api/auth/logout           - Logout user");
      console.log("├─ POST /api/auth/refresh-token    - Refresh token");
      console.log("└─ GET  /api/auth/me               - Get current user\n");

      console.log("🔐 Security Features:");
      console.log("├─ Rate limiting enabled");
      console.log("├─ CORS configured");
      console.log("├─ Helmet security headers");
      console.log("└─ HTTP-only cookies\n");

      console.log("📧 Email Service:");
      console.log(`└─ Provider: ${process.env.EMAIL_SERVICE || "SMTP"}\n`);

      console.log("💡 Tips:");
      console.log("├─ Use Postman/Insomnia to test APIs");
      console.log("├─ Check README.md for API documentation");
      console.log("└─ Press Ctrl+C to stop the server\n");
    });

    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is already in use`);
        console.log("💡 Try these solutions:");
        console.log("   1. Stop the other process using this port");
        console.log("   2. Change PORT in your .env file");
        console.log(`   3. Kill the process: lsof -ti:${PORT} | xargs kill -9\n`);
      } else {
        console.error("\n❌ Server error:", error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n\n🛑 ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("✅ HTTP server closed");

        try {
          // Close database connection
          const mongoose = await import("mongoose");
          await mongoose.connection.close();
          console.log("✅ Database connection closed");

          // Close email connection
          const { closeEmailConnection } = await import("./configs/mail.config");
          await closeEmailConnection();

          console.log("✅ All connections closed successfully");
          console.log("👋 Goodbye!\n");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during shutdown:", err);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("\n⚠️  Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      console.error("\n❌ Uncaught Exception:", error);
      console.error("Stack:", error.stack);
      gracefulShutdown("uncaughtException");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("\n❌ Unhandled Rejection at:", promise);
      console.error("Reason:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("\n❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
export default app;