import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  // REAL WORLD ADDITION: Due Date (14 days from issue)
  dueDate: { type: Date, default: () => Date.now() + 14 * 24 * 60 * 60 * 1000 }, 
  returnDate: { type: Date },
  // REAL WORLD ADDITION: Fine amount (calculated on return)
  fine: { type: Number, default: 0 },
  status: { type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' },
  // NEW FEATURE: Private Notes
  notes: { type: String, default: '' }
});

export default mongoose.model('Issue', issueSchema);