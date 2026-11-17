const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Please specify requested quantity'],
      min: 1,
    },
    servingsRequested: {
      type: Number,
      default: function () {
        return this.requestedQuantity || 1;
      },
    },
    quantityUnit: {
      type: String,
      default: 'meals',
    },
    beneficiaries: {
      type: Number,
      default: 40,
      min: 1,
    },
    pickupTime: {
      type: String,
      required: [true, 'Please provide estimated pickup time'],
    },
    proposedPickupTime: {
      type: String,
      default: function () {
        return this.pickupTime;
      },
    },
    volunteerName: {
      type: String,
      required: [true, 'Please provide volunteer / driver name'],
      trim: true,
    },
    volunteerPhone: {
      type: String,
      required: [true, 'Please provide volunteer phone number'],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    verificationOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Rejected',
        'Ready for Pickup',
        'Picked Up',
        'Delivered',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },
    responseNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

donationRequestSchema.index({ donation: 1, ngo: 1 });
donationRequestSchema.index({ donor: 1, status: 1 });
donationRequestSchema.index({ ngo: 1, status: 1 });

donationRequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
