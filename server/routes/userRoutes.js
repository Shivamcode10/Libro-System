import express from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios'; 
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/userModel.js'; 
import Issue from '../models/issueModel.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// --- HELPER FUNCTION ---
const getUserId = (req) => {
    return req.user._id || req.user.id;
};

// ✅ FIXED CLOUDINARY STORAGE FOR AVATARS
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  upload_preset: 'unsigned', // ⚠️ Make sure this exact name exists in Cloudinary Dashboard
  params: {
    folder: 'librosys/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => {
      // ✅ SAFETY FIX: Check if req.user exists to prevent crash
      const userId = req.user && req.user.id ? req.user.id : 'unknown';
      return `avatar-${userId}-${Date.now()}`;
    }
  }
});

const upload = multer({ storage: avatarStorage });

// 1. GET PROFILE INFO
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE PROFILE (With Geocoding)
router.put('/me', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, phone, address } = req.body;
    const updateData = { name, phone, address };

    if (address && address !== 'Not added') {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: address, format: 'json', limit: 1 }
        });

        if (response.data && response.data.length > 0) {
          updateData.lat = parseFloat(response.data[0].lat);
          updateData.lng = parseFloat(response.data[0].lon);
        }
      } catch (geoError) {
        console.error("Geocoding failed:", geoError);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. CHANGE PASSWORD
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { current, new: newPassword } = req.body;

    if (!current || !newPassword) {
        return res.status(400).json({ message: "Please provide current and new password" });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. UPLOAD AVATAR (WITH DEBUGGING LOGS)
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    // ✅ DEBUGGING BLOCK: This will tell us why it crashes
    console.log("=== CLOUDINARY DEBUG ===");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "FOUND" : "MISSING");
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "FOUND" : "MISSING");
    console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "FOUND" : "MISSING");
    console.log("======================");

    const userId = getUserId(req);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File received:", req.file.filename);
    const avatarUrl = req.file.path; 
    
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true }).select('-password');
    
    res.json({ message: "Avatar updated", avatarUrl, user });
  } catch (err) {
    console.error("Upload Avatar error:", err);
    // Return the actual error message to frontend so we can see it
    res.status(500).json({ error: err.message });
  }
});

// 5. GET USER STATS
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const totalIssues = await Issue.countDocuments({ user: userId });
    const points = totalIssues * 10;
    res.json({ issued: totalIssues, points: points });
  } catch (err) {
    console.error("❌ /stats Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. ADMIN: GET ALL USERS
router.get('/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin Only" });
    }
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. COMMUNITY ROUTE
router.get('/community', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: getUserId(req) } 
    }).select('name avatar address lat lng role');
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ADMIN: DELETE USER
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin Only" });
    }
    
    const targetId = req.params.id;
    const currentId = getUserId(req);

    if (currentId === targetId) {
      return res.status(400).json({ message: "You cannot delete yourself." });
    }

    await User.findByIdAndDelete(targetId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;