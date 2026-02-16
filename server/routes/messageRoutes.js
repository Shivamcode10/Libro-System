import express from 'express';
import Message from '../models/Message.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// GET /api/messages/:userId
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name avatar') // <--- FIXED: Now sends Name & Avatar
    .sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id || req.user.id;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver ID and Text are required" });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      text
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('sender', 'name avatar');
    await savedMessage.populate('receiver', 'name avatar');

    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;