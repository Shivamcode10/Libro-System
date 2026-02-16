import Marketplace from '../models/Marketplace.js';

const getAllListings = async (req, res) => {
  try {
    const listings = await Marketplace.find()
      .sort({ createdAt: -1 })
      .populate('seller', 'name email _id')
      .populate('buyer', 'name email _id'); 
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createListing = async (req, res) => {
  try {
    const { title, author, price, condition, upiId = '' } = req.body; 

    if (!title || !author || !price) {
      return res.status(400).json({ message: 'Please provide title, author, and price' });
    }

    const listing = await Marketplace.create({
      title,
      author,
      price,
      condition,
      upiId, 
      seller: req.user.id
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
};

const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Marketplace.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (status === 'Processing') {
       listing.buyer = req.user.id;
       listing.status = 'Processing';
    }

    if (status === 'Delivered') {
       if (listing.seller.toString() !== req.user.id) {
         return res.status(401).json({ message: 'Only seller can mark as delivered' });
       }
       listing.status = 'Delivered';
    }

    await listing.save();
    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Marketplace.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getAllListings, createListing, updateListingStatus, deleteListing };