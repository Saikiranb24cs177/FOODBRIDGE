const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodName: {
      type: String,
      required: [true, 'Please provide the food item name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Cooked meals',
        'Rice and grains',
        'Vegetables',
        'Fruits',
        'Bakery items',
        'Packaged food',
        'Other',
      ],
      default: 'Cooked meals',
    },
    dietaryType: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'],
      default: 'Vegetarian',
    },
    quantity: {
      type: String,
      required: [true, 'Please provide quantity'],
      trim: true,
    },
    quantityUnit: {
      type: String,
      enum: ['packets', 'meals', 'kg', 'servings'],
      default: 'meals',
    },
    servings: {
      type: Number,
      required: [true, 'Please provide estimated number of servings'],
      min: [1, 'Servings must be at least 1'],
    },
    cookedTime: {
      type: Date,
      required: [true, 'Please provide the food preparation/cooking time'],
    },
    expiryTime: {
      type: Date,
      required: [true, 'Please provide the safe consumption / expiry deadline'],
    },
    pickupAddress: {
      type: String,
      required: [true, 'Please specify pickup address'],
      trim: true,
    },
    pickupCity: {
      type: String,
      required: [true, 'Please specify pickup city'],
      trim: true,
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
        default: [77.5946, 12.9716],
      },
    },
    pickupStartTime: {
      type: String,
      default: '12:00',
    },
    pickupEndTime: {
      type: String,
      default: '18:00',
    },
    pickupWindow: {
      from: { type: String, default: '12:00' },
      to: { type: String, default: '18:00' },
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide a pickup contact number'],
      trim: true,
    },
    additionalInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    },
    safetyCertified: {
      type: Boolean,
      required: [true, 'You must certify the safety and hygiene of the surplus food'],
      validate: {
        validator: function (v) {
          return v === true;
        },
        message: 'Food safety declaration is mandatory to donate',
      },
    },
    storageInstruction: {
      type: String,
      enum: ['Keep Refrigerated', 'Keep Hot', 'Room Temperature', 'Dry Storage'],
      default: 'Room Temperature',
    },
    status: {
      type: String,
      enum: [
        'Available',
        'Draft',
        'Requested',
        'Accepted',
        'Ready for Pickup',
        'Picked Up',
        'Delivered',
        'Completed',
        'Cancelled',
      ],
      default: 'Available',
    },
    assignedNgo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      default: null,
    },
    reportsCount: {
      type: Number,
      default: 0,
    },
    reportReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

foodDonationSchema.index({ location: '2dsphere' });
foodDonationSchema.index({ status: 1, pickupCity: 1, expiryTime: 1 });

foodDonationSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryTime;
});

foodDonationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
