import mongoose from 'mongoose';

const MarketplaceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String },
  
  // Updated to upiId
  upiId: { type: String }, 

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Available', 'Processing', 'Delivered'], 
    default: 'Available' 
  }
}, { timestamps: true });

const Marketplace = mongoose.models.Marketplace || mongoose.model('Marketplace', MarketplaceSchema);

export default Marketplace;