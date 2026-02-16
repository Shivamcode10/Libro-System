import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Book from '../models/bookModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- CONFIGURE MULTTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// 1. GET ALL BOOKS
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. CRITICAL: PROTECTED DOWNLOAD ROUTE
// MUST BE BEFORE /:id
// ==========================================
router.get('/:id/download', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // PERMISSION CHECK
    if (String(book.issuedBy) !== String(req.user._id)) {
      console.log("Unauthorized download attempt by user:", req.user.name);
      return res.status(403).json({ message: 'Forbidden: You do not have permission to download this book.' });
    }

    if (!book.fileUrl) {
      return res.status(404).json({ message: 'File not available' });
    }

    const filePath = path.join('uploads', book.fileUrl);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, book.title + '.pdf'); 
    } else {
      res.status(404).json({ message: 'File missing on server' });
    }
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: 'Download failed' });
  }
});

// 3. GET SINGLE BOOK (Must come AFTER /:id/download)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) res.json(book);
    else res.status(404).json({ message: 'Book not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. CREATE BOOK (Admin Only)
router.post('/', protect, admin, upload.single('bookFile'), async (req, res) => {
  try {
    const { title, author, category, pages, description } = req.body;
    
    let finalPages = parseInt(pages) || 0;
    let finalAuthor = author || "Unknown Author";

    if (req.file && req.file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        finalPages = data.numpages;
      } catch (err) {
        console.error("Error parsing PDF:", err);
      }
    }

    if (finalPages > 5000) {
      return res.status(400).json({ message: 'Book pages cannot exceed 5000.' });
    }

    const book = await Book.create({
      title,
      author: finalAuthor,
      category,
      description: description || 'No description',
      status: 'Available',
      pages: finalPages,
      fileUrl: req.file.filename,
      issuedBy: null,
      addedBy: req.user._id
    });
    res.status(201).json(book);
  } catch (error) {
    console.error("Create Book Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 5. UPDATE BOOK (Admin Only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, author, category, description, pages, status } = req.body;
    const updateData = { title, author, category, description, pages, status };
    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. DELETE BOOK (Admin Only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.fileUrl) {
      const filePath = path.join('uploads', book.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book and associated file removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

export default router;