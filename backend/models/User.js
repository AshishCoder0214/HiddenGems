import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  savedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gem' }],
  contributionsCount: { type: Number, default: 0 },
  explorerLevel: { type: Number, default: 1 },
  badges: [{ type: String }],
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Indexing common query parameters
UserSchema.index({ explorerLevel: 1 });

// Soft delete query helpers and middleware
UserSchema.pre(/^find/, function () {
  this.where({ deletedAt: null });
});

// Hashing password pre-save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password function
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
