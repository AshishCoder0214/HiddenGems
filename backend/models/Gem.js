import mongoose from 'mongoose';

const GemSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: {
      values: ['Cafe', 'Park', 'Study', 'Viewpoint', 'Food', 'Photography'],
      message: 'Category must be one of: Cafe, Park, Study, Viewpoint, Food, Photography'
    }
  },
  images: [{ 
    type: String,
    match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
  }],
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(val) {
          return val.length === 2 && 
                 val[0] >= -180 && val[0] <= 180 && 
                 val[1] >= -90 && val[1] <= 90;
        },
        message: 'Coordinates must be valid [Longitude (-180 to 180), Latitude (-90 to 90)]'
      }
    }
  },
  costEstimate: { type: Number, required: true, min: 1, max: 3 },
  crowdLevel: { type: Number, required: true, min: 1, max: 5 },
  noiseLevel: { type: Number, required: true, min: 1, max: 5 },
  safetyRating: { type: Number, required: true, min: 1, max: 5 },
  wiFiAvailable: { type: Boolean, default: false },
  hiddenGemScore: { type: Number, required: true, min: 0, max: 10 },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Optimization Indexes
GemSchema.index({ coordinates: '2dsphere' });
GemSchema.index({ category: 1 });
GemSchema.index({ submittedBy: 1 });
GemSchema.index({ createdAt: -1 });
GemSchema.index({ crowdLevel: 1 });
GemSchema.index({ noiseLevel: 1 });

// Soft Delete pre-hook
GemSchema.pre(/^find/, function () {
  this.where({ deletedAt: null });
});

// Cascade cleanup on soft delete
GemSchema.pre('save', async function () {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await mongoose.model('User').updateMany(
      { savedPlaces: this._id },
      { $pull: { savedPlaces: this._id } }
    );
  }
});

export const Gem = mongoose.models.Gem || mongoose.model('Gem', GemSchema);
