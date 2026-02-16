import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import path from 'path';
import axios from 'axios'; // <--- ADDED: Required for Geocoding
import User from '../models/userModel.js'; 
import Issue from '../models/issueModel.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// --- HELPER FUNCTION ---
// Get User ID safely regardless of whether token stores it in 'id' or '_id'
const getUserId = (req) => {
    return req.user._id || req.user.id;
};

// Setup Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 1. GET PROFILE INFO
// Matches Frontend: api.get('/user/me')
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

// 2. UPDATE PROFILE (UPDATED: With Geocoding)
router.put('/me', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, phone, address } = req.body;
    
    const updateData = { name, phone, address };

    // --- NEW: GEOCODING LOGIC ---
    // Convert Address string to Latitude/Longitude automatically
    if (address && address !== 'Not added') {
      try {
        // Using OpenStreetMap (Nominatim) - Free
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: address, format: 'json', limit: 1 }
        });

        if (response.data && response.data.length > 0) {
          updateData.lat = parseFloat(response.data[0].lat);
          updateData.lng = parseFloat(response.data[0].lon);
        }
      } catch (geoError) {
        console.error("Geocoding failed:", geoError);
        // We continue even if geocoding fails, just won't update map coords
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password'); // Don't return password

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
    
    const { current, new: newPassword } = req.body; // Match frontend payload

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

// 4. UPLOAD AVATAR
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true }).select('-password');
    
    res.json({ message: "Avatar updated", avatarUrl, user });
  } catch (err) {
    console.error("Upload Avatar error:", err);
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

// --- NEW: COMMUNITY ROUTE ---
// Gets all users except the current one for the Map/Community feature
router.get('/community', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: getUserId(req) } 
    }).select('name avatar address lat lng role'); // Select only necessary fields
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. ADMIN: DELETE USER
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