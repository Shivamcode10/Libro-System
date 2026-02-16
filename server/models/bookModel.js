import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: 'No description' },
  status: { type: String, enum: ['Available', 'Issued'], default: 'Available' },
  pages: { type: Number, required: true },
  fileUrl: { type: String, default: '' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// CREATE TEXT INDEX FOR FAST SEARCHING
bookSchema.index({ title: 'text', description: 'text', author: 'text', category: 'text' });

export default mongoose.model('Book', bookSchema);