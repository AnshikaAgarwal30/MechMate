const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'mechanic'],
    default: 'customer'
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  mechanicDetails: {
    specialization: [String],
    experience: Number,
    licenseNumber: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    hourlyRate: Number
  },
  vehicleDetails: [{
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    vin: String
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['request', 'booking', 'review', 'system']
    },
    message: String,
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
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

userSchema.index({ 'address.location': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', userSchema);
