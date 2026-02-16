import express from 'express';
import Issue from '../models/issueModel.js';
import Book from '../models/bookModel.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Helper to get user ID safely
const getUserId = (req) => String(req.user._id || req.user.id);

// 1. POST: Issue a Book
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookId } = req.body; 
    const userId = getUserId(req);
    
    // 1. Check Book existence and status
    const book = await Book.findById(bookId);
    
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.status !== 'Available') {
      return res.status(400).json({ message: 'Book is currently not available' });
    }

    // 2. Create Issue Record
    const issue = await Issue.create({ 
      book: bookId, 
      user: userId,
      // dueDate is handled by the model default
    });
    
    // 3. Update Book Status
    book.status = 'Issued';
    book.issuedBy = userId; // Track the user who has the book
    await book.save();

    res.status(201).json(issue);
  } catch (err) {
    console.error("Issue Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. PUT: Return a Book with Fine Calculation
router.put('/return', verifyToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = getUserId(req);

    // 1. Find Active Issue
    const issue = await Issue.findOne({ book: bookId, user: userId, status: 'Issued' });
    if (!issue) return res.status(404).json({ message: "No active issue found for this book." });

    // 2. Calculate Fine
    const returnDate = new Date();
    const dueDate = new Date(issue.dueDate);
    let fine = 0;

    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fine = diffDays * 2; // $2 per day
    }

    // 3. Update Issue Record
    issue.returnDate = returnDate;
    issue.fine = fine;
    issue.status = fine > 0 ? 'Overdue' : 'Returned'; 
    await issue.save();

    // 4. Reset Book Status
    await Book.findByIdAndUpdate(bookId, { status: 'Available', issuedBy: null });

    res.json({ 
      message: fine > 0 ? `Book returned late. Fine: $${fine}` : "Book returned successfully.", 
      fine 
    });
  } catch (err) {
    console.error("Return Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET: User History
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const history = await Issue.find({ user: userId })
      .populate('book', 'title author fileUrl category') 
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. NEW: USER NOTES FEATURE (UPDATED)
// ==========================================

// GET: Fetch notes for a specific book (Works for current and past issues)
router.get('/book/:bookId/notes', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookId } = req.params;

    // REMOVED: status: 'Issued'
    // Now it finds notes even if the book was returned
    const issue = await Issue.findOne({ book: bookId, user: userId });
    
    if (!issue) {
      return res.status(404).json({ message: 'No record found for this book.' });
    }
    
    res.json({ notes: issue.notes || '' });
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT: Save/Update notes for a specific book (Works for current and past issues)
router.put('/book/:bookId/notes', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookId } = req.params;
    const { notes } = req.body;
    
    // REMOVED: status: 'Issued'
    const issue = await Issue.findOneAndUpdate(
      { book: bookId, user: userId },
      { notes }, 
      { new: true, upsert: true } // upsert creates it if it doesn't exist (though it should)
    );

    if (!issue) {
      return res.status(404).json({ message: 'Failed to save notes.' });
    }

    res.json({ 
      message: 'Notes saved successfully', 
      notes: issue.notes 
    });
  } catch (error) {
    console.error("Save Notes Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;