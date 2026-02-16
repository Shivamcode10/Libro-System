import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookTitle: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  message: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);