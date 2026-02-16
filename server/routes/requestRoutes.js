import express from 'express';
import Request from '../models/requestModel.js';
import Book from '../models/bookModel.js';
import Issue from '../models/issueModel.js'; 
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// 1. User requests a book
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookTitle, author, message, bookId } = req.body;
    
    const request = await Request.create({
      user: req.user._id,
      bookTitle,
      author,
      message,
      bookId: bookId || null // We now expect the ID to be sent
    });
    res.status(201).json(request);
  } catch (err) {
    console.error("Request Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get all requests (Admin)
router.get('/all', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const requests = await Request.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SOLID ARCHITECTURE: Update status + Auto-Issue (With Safe Regex)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    // Step A: Update the Request Status
    const request = await Request.findByIdAndUpdate(requestId, { status }, { new: true }).populate('user');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found in database.' });
    }

    // Step B: If Approved, Auto-Issue the book
    if (status === 'Approved') {
      
      // SAFETY CHECK 1: Ensure the requesting user still exists
      if (!request.user) {
        return res.status(400).json({ message: 'Cannot approve: The user who requested this book has been deleted.' });
      }

      let book;

      // 1. Try finding by bookId (PRIORITY - 100% Accurate for New Requests)
      if (request.bookId) {
        book = await Book.findById(request.bookId);
      }

      // 2. Fallback: Safe Regex Search (Handles old requests / Title mismatches)
      if (!book) {
        // This removes special characters like ' ( ) that break regex searches
        const cleanTitle = request.bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
        console.log("🔍 Searching for book with title:", cleanTitle);
        
        book = await Book.findOne({ title: new RegExp(cleanTitle, 'i') });
      }
      
      // SAFETY CHECK 2: Ensure book exists
      if (!book) {
        console.error("⚠️ Book not found for approval:", request.bookTitle);
        return res.status(404).json({ message: `Book "${request.bookTitle}" not found in database. Cannot auto-issue.` });
      }

      // SAFETY CHECK 3: Ensure book is available
      if (book.status !== 'Available') {
        return res.status(400).json({ 
          message: `Cannot approve. Book is currently '${book.status}'.` 
        });
      }

      // 1. Create Issue Record
      try {
        await Issue.create({ 
          book: book._id, 
          user: request.user._id 
        });
      } catch (err) {
        console.error("Issue Creation Error:", err);
        return res.status(500).json({ message: "Failed to create issue record." });
      }
      
      // 2. Update Book Status
      book.status = 'Issued';
      book.issuedBy = String(request.user._id);
      await book.save();
      
      console.log(`✅ Auto-Issued: "${book.title}" to ${request.user.name}`);
    }

    res.json(request);
  } catch (err) {
    console.error("Approve Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;