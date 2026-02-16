import express from 'express';
import { getAllListings, createListing, deleteListing, updateListingStatus } from '../controllers/marketplaceController.js';
// FIX: Added braces { } because your authMiddleware uses Named Exports
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllListings)
  .post(protect, createListing);

router.route('/:id')
  .delete(protect, deleteListing);

// Route for Status Update
router.put('/:id/status', protect, updateListingStatus);

export default router;