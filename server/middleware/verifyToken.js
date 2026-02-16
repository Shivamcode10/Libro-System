import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  let token = null;

  // 1️⃣ First try cookie (PRODUCTION LOGIN)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ Fallback: Authorization header (for Postman / dev)
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  // 3️⃣ No token found
  if (!token) {
    console.log("❌ Auth Failed: No Token Found");
    return res.status(401).json({ message: "Not authenticated. No token." });
  }

  try {
    // 4️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ensure mongoose compatibility
    req.user = {
      _id: decoded.id || decoded._id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    console.log("✅ Auth Success:", req.user._id);
    next();

  } catch (err) {
    console.log("❌ Auth Failed: Invalid Token", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

export default verifyToken;
