import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import verifyToken from "./middleware/verifyToken.js";
import cookieParser from "cookie-parser";
import path from "path";

// ==========================
// CONFIG
// ==========================
dotenv.config();
connectDB();

const app = express();

// ==========================
// CORS FIX (IMPORTANT)
// ==========================
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options("*", cors());

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ==========================
// ROOT ROUTE
// ==========================
app.get("/", (req, res) => {
  res.send("Libro System API Running 🚀");
});

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", verifyToken, issueRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/messages", verifyToken, messageRoutes);
app.use("/api/requests", verifyToken, requestRoutes);
app.use("/api/reviews", reviewRoutes);

// ==========================
// STATIC FILES
// ==========================
app.use("/uploads", express.static(path.join(path.resolve(), "uploads"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.set("Content-Disposition", "attachment");
    } else {
      res.set("Content-Disposition", "inline");
    }
  }
}));

// ==========================
// ERROR HANDLER
// ==========================
app.use(errorHandler);

// ==========================
// SERVER START
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
