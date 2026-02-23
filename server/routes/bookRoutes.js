import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Book from '../models/bookModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import axios from 'axios'; // ✅ ADD THIS IMPORT FOR DOWNLOAD FIX

const router = express.Router();

// ✅ STORAGE CONFIGURATION (Keep as is)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  upload_preset: 'unsigned', 
  params: async (req, file) => {
    if (file.mimetype === 'application/pdf') {
      return {
        folder: 'librosys/books',
        format: 'pdf',
        resource_type: 'raw', 
        public_id: `book-${Date.now()}-${Math.round(Math.random() * 1E9)}`
      };
    } else {
      return {
        folder: 'librosys/books',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'image',
        public_id: `book-${Date.now()}-${Math.round(Math.random() * 1E9)}`
      };
    }
  }
});

const upload = multer({ storage: storage });

// 1. GET ALL BOOKS
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. DOWNLOAD ROUTE (FIXED)
router.get('/:id/download', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (String(book.issuedBy) !== String(req.user._id)) {
      console.log("Unauthorized download attempt by user:", req.user.name);
      return res.status(403).json({ message: 'Forbidden: You do not have permission to download this book.' });
    }

    if (!book.fileUrl) {
      return res.status(404).json({ message: 'File not available' });
    }

    // ✅ FIX: Fetch file from Cloudinary and stream it to user
    // This bypasses 401/404 errors that happen with redirects
    const response = await axios.get(book.fileUrl, { responseType: 'stream' });

    // Set header to force browser to download the file
    res.setHeader('Content-Disposition', `attachment; filename="${book.title}.pdf"`);
    
    // Pipe the data stream to the response
    response.data.pipe(res);

  } catch (error) {
    console.error("Download Error:", error);
    if (error.response && error.response.status === 401) {
        return res.status(403).json({ message: 'Access denied. This file is private.' });
    }
    res.status(500).json({ message: 'Download failed. The file might be missing or restricted.' });
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
      fileUrl: req.file.path, 
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

// 6. DELETE BOOK (FIXED)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.fileUrl && book.fileUrl.includes('cloudinary')) {
      try {
        // ✅ FIX: Extract resource type to handle PDFs correctly
        const isPdf = book.fileUrl.includes('/raw/upload/');
        const resourceType = isPdf ? 'raw' : 'image';

        // Extract public_id logic
        const urlParts = book.fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0];
        
        // Destroy with explicit resource type
        await cloudinary.uploader.destroy(`librosys/books/${publicId}`, { resource_type: resourceType });
        console.log(`Deleted from Cloudinary: librosys/books/${publicId}`);
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr);
      }
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

export default router;