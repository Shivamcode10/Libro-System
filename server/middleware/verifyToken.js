import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  // 1. Get Token from Header (Bearer token) OR Cookie
  let token = req.headers.authorization?.split(" ")[1];
  
  // Fallback to Cookie if header is missing
  if (!token && req.cookies) {
    token = req.cookies.token || req.cookies.authToken;
  }

  if (!token) {
    console.log("❌ Auth Failed: No Token Found");
    return res.status(401).json({ message: "Not authenticated. No token." });
  }

  try {
    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 3. CRITICAL FIX: Ensure _id exists for Mongoose compatibility
    // If the token has 'id' but not '_id', map it.
    if (!decoded._id && decoded.id) {
        decoded._id = decoded.id;
    }
    
    req.user = decoded; 
    console.log("✅ Auth Success: User ID is", req.user._id);
    next();
  } catch (err) {
    console.log("❌ Auth Failed: Invalid Token", err.message);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

export default verifyToken;