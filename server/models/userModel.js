import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  
  phone: { type: String, default: 'Not added' },
  address: { type: String, default: 'Not added' },
  
  // --- NEW: MAP COORDINATES ---
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  
  avatar: { type: String, default: null },
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);