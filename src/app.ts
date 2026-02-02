import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";

// Import routes
import authRoutes from "./routes/user.route.js";

// Import middleware
import {
  errorHandler,
  notFoundHandler,
} from "./handler/error.handler.js";
import { apiLimiter } from "./middlewares/rate.limit.middleware.js";

// Import config
import { verifyEmailConnection } from "./configs/mail.config.js";

// Load environment variables
config();

// Create Express app
const app: Application = express();

// ===========================
// Security Middleware
// ===========================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ===========================
// Body Parsing Middleware
// ===========================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// ===========================
// Rate Limiting
// ===========================

// Apply general API rate limiting
app.use("/api", apiLimiter);

// ===========================
// Routes
// ===========================

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// API Routes
app.use("/api/auth", authRoutes);

// ===========================
// Error Handling
// ===========================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ===========================
// Database Connection
// ===========================

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Mongoose connection options
    const options = {
      autoIndex: true, // Build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(mongoURI, options);

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || "Unknown"}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);

    // Verify email service connection
    const emailVerified = await verifyEmailConnection();
    if (emailVerified) {
      console.log("📧 Email service is ready");
    } else {
      console.warn(
        "⚠️  Email service verification failed - emails may not send",
      );
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("Please check your MONGODB_URI in .env file");
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("📴 Mongoose disconnected from MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
});

export default app;
