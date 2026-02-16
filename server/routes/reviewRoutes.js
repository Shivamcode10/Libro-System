import express from 'express';
import Review from '../models/reviewModel.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Add a review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;