import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import userRoutes from './routes/userRoutes.js';
import requestRoutes from './routes/requestRoutes.js'; // Ensure this file exists
import reviewRoutes from './routes/reviewRoutes.js';     // Ensure this file exists
import errorHandler from './middleware/errorMiddleware.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import path from 'path';

// Import Middleware
import verifyToken from './middleware/verifyToken.js'; 
import cookieParser from 'cookie-parser';


// Load Config
dotenv.config();
connectDB();

const app = express();

// ==========================
// 1. CORS CONFIGURATION
// ==========================
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, 
  optionsSuccessStatus: 200,
};

app.get("/", (req, res) => {
  res.send("Libro System API Running 🚀");
});


app.use(cors(corsOptions));
app.use(express.json());

// ==========================
// 2. MIDDLEWARE
// ==========================
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); 

// ==========================
// 3. ROUTES
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', verifyToken, issueRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/messages', verifyToken, messageRoutes);

// Static Files
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.set('Content-Disposition', 'attachment');
    } else {
      res.set('Content-Disposition', 'inline');
    }
  }
}));

// --- NEW ROUTES ADDED HERE ---
app.use('/api/requests', verifyToken, requestRoutes);
app.use('/api/reviews', reviewRoutes); 

// Error Handler
app.use(errorHandler);

// ==========================
// 4. SERVER START
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));