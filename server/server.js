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

// ==========================
// CONFIG
// ==========================
dotenv.config();
connectDB();

const app = express();


// ==========================
// 🌐 GLOBAL CORS HANDLER (FINAL FIX)
// ==========================
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // reflect requesting origin (required for cookies auth)
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

  // handle preflight request
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
app.use(
  "/uploads",
  express.static(path.join(path.resolve(), "uploads"), {
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
