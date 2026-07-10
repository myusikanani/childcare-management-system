const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'caretaker', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  // Parent specific fields
  parentPhoto: {
    type: String,
    default: null
  },
  fatherPhoto: {
    type: String,
    default: null
  },
  children: [{
    name: String,
    age: String,
    gender: String,
    allergies: String,
    notes: String,
    photo: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // Caretaker specific fields
  bio: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  specializations: [{
    type: String
  }],
  availability: {
    type: Map,
    of: Boolean,
    default: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  languages: [{
    type: String
  }],
  certifications: [{
    type: String
  }],
  // 2FA Settings
  is2FAEnabled: {
    type: Boolean,
    default: false
  },
  twoFASecret: {
    type: String,
    default: null
  },
  twoFABackupCodes: [{
    code: String,
    used: { type: Boolean, default: false }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full avatar URL
userSchema.virtual('avatarUrl').get(function() {
  if (this.avatar && !this.avatar.startsWith('http')) {
    return `${process.env.BASE_URL || 'http://localhost:5000'}${this.avatar}`;
  }
  return this.avatar;
});

// Include virtuals in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
