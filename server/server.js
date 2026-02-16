import express from "express";
import dotenv from "dotenv";
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
import { fileURLToPath } from 'url';

// ✅ IMPORT CLOUDINARY
import { v2 as cloudinary } from 'cloudinary';

// ==========================
// CONFIG
// ==========================
dotenv.config();
connectDB();

const app = express();

// ✅ CONFIGURE CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==========================
// 🌐 GLOBAL CORS HANDLER
// ==========================
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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
  res.send("Libro System API Running 🚀 (Cloudinary Integrated)");
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
// STATIC FILES (Legacy Support)
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.set("Content-Disposition", "attachment");
      } else {
        res.set("Content-Disposition", "inline");
      }
    },
  })
);

// ==========================
// ERROR HANDLER
// ==========================
app.use(errorHandler);

// ==========================
// SERVER START
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));