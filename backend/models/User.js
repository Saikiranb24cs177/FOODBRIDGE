const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'admin'],
      default: 'donor',
    },
    organizationName: {
      type: String,
      trim: true,
      default: '',
    },
    organizationType: {
      type: String,
      enum: [
        'Hotel',
        'Restaurant',
        'Hostel',
        'Function Hall',
        'Catering Service',
        'Corporate Cafeteria',
        'Supermarket',
        'NGO',
        'Orphanage',
        'Old-Age Home',
        'Community Shelter',
        'Charitable Trust',
        'Individual',
        'Other',
      ],
      default: 'Individual',
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide your city'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: 'Karnataka',
    },
    pinCode: {
      type: String,
      trim: true,
      default: '560001',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.5946, 12.9716], // default Bengaluru
      },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
    },
    verificationDetails: {
      registrationNumber: { type: String, default: '' },
      darpanId: { type: String, default: '' },
      taxExemption80G: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    beneficiaryCapacity: {
      type: Number,
      default: 50,
    },
    preferredCategories: {
      type: [String],
      default: ['Cooked Meals', 'Rice and grains', 'Packaged food', 'Fruits', 'Vegetables', 'Bakery items'],
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Geo index
userSchema.index({ location: '2dsphere' });

// Virtual for id mapping
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
