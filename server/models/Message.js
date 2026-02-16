import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for faster lookup of conversations between two users
messageSchema.index({ sender: 1, receiver: 1 });

export default mongoose.model('Message', messageSchema);