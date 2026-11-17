const mongoose = require('mongoose');

const trackingLogSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: function () {
        return this.newStatus;
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['donor', 'ngo', 'admin', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

trackingLogSchema.set('toJSON', { virtuals: true });

const TrackingLog = mongoose.model('TrackingLog', trackingLogSchema);
module.exports = TrackingLog;
