const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String
  },
  /*location: {
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },*/

  location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  },
  address: {
    type: String,
    required: true
  }
},
  issueType: {
    type: String,
    enum: ['engine', 'tire', 'battery', 'fuel', 'accident', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  estimatedArrival: Date,
  estimatedCost: Number,
  actualCost: Number,
  images: [String],
  aiDiagnosis: {
    summary: String,
    predictedIssueType: String,
    issueTitle: String,
    confidenceScore: String,
    possibleCauses: [String],
    safetyAdvice: [String],
    recommendedSpecialization: [String],
    recommendedUrgency: String,
    detectedComponents: [String],
    disclaimer: String,
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
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

requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
