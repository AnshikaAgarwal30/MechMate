const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
  serviceType: {
    type: String,
    enum: ['roadside', 'scheduled', 'inspection'],
    required: true
  },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: value => Array.isArray(value) && value.length === 2,
        message: 'Location coordinates must be [longitude, latitude]'
      }
    },
    address: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedCost: Number,
  actualCost: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: String
}, { timestamps: true });

bookingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
