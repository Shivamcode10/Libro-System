import express from 'express';
// ✅ UPDATED IMPORTS FOR CLOUDINARY
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Book from '../models/bookModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ SETUP CLOUDINARY STORAGE FOR BOOKS
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'librosys/books',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    public_id: (req, file) => {
      // Custom naming: book-timestamp-random
      return `book-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    }
  },
});

const upload = require('multer')({ storage: storage });

// 1. GET ALL BOOKS
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. DOWNLOAD ROUTE
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

    // ✅ REDIRECT TO CLOUDINARY URL (Fastest way for PDFs)
    return res.redirect(book.fileUrl);

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: 'Download failed' });
  }
});

// 3. GET SINGLE BOOK
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) res.json(book);
    else res.status(404).json({ message: 'Book not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. CREATE BOOK
router.post('/', protect, admin, upload.single('bookFile'), async (req, res) => {
  try {
    const { title, author, category, pages, description } = req.body;
    
    // Note: Automatic PDF page counting is disabled for Cloudinary streams
    // to avoid complexity. Use the 'pages' input field.
    let finalPages = parseInt(pages) || 0;
    let finalAuthor = author || "Unknown Author";

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
      fileUrl: req.file.path, // ✅ Cloudinary returns the FULL URL here
      issuedBy: null,
      addedBy: req.user._id
    });
    res.status(201).json(book);
  } catch (error) {
    console.error("Create Book Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 5. UPDATE BOOK
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

// 6. DELETE BOOK
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // ✅ DELETE FROM CLOUDINARY
    if (book.fileUrl && book.fileUrl.includes('cloudinary')) {
      try {
        // Extract public_id from the Cloudinary URL
        // URL format: .../v123456789/folder/public_id.ext
        const urlParts = book.fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0];
        
        // We need to include the folder used in storage config
        await cloudinary.uploader.destroy(`librosys/books/${publicId}`);
        console.log(`Deleted from Cloudinary: librosys/books/${publicId}`);
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr);
        // Continue to delete DB record even if cloud delete fails
      }
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

export default router;