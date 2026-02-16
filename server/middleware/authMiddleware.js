import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect Routes (Login Required)
const protect = async (req, res, next) => {
  let token;

  // 1. CHECK COOKIE (Primary for Vercel+Render)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. CHECK HEADER (Fallback for Postman/Dev)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
      console.log("Header Token Parse Error");
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found' });
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');
    
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin Only Routes
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin };