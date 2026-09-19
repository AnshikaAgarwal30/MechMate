const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { mechanic, serviceType, scheduledDate, scheduledTime, location, notes } = req.body;

    if (!location?.address || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'A valid service address and current location coordinates are required.'
      });
    }

    const mechanicUser = await User.findOne({
      _id: mechanic,
      role: 'mechanic',
      'mechanicDetails.isVerified': true,
      'mechanicDetails.isAvailable': true
    });

    if (!mechanicUser) {
      return res.status(400).json({
        success: false,
        message: 'Selected mechanic is not available or not verified.'
      });
    }

    const booking = await Booking.create({
      customer: req.user.id,
      mechanic,
      serviceType,
      scheduledDate,
      scheduledTime,
      location: {
        type: 'Point',
        coordinates: location.coordinates.map(Number),
        address: location.address
      },
      notes
    });

    await Notification.create({
      recipient: mechanic,
      type: 'booking',
      title: 'New Booking Request',
      message: `You have a new booking request for ${scheduledDate} at ${scheduledTime}`,
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const query = req.user.role === 'customer'
      ? { customer: req.user.id }
      : req.user.role === 'mechanic'
        ? { mechanic: req.user.id }
        : {};

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('mechanic', 'name email phone mechanicDetails')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('mechanic', 'name email phone mechanicDetails');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner =
      req.user.role === 'admin' ||
      booking.customer._id.toString() === req.user.id ||
      booking.mechanic._id.toString() === req.user.id;

    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, actualCost, message } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned mechanic can update this booking' });
    }

    booking.status = status;
    if (actualCost !== undefined && actualCost !== '') booking.actualCost = Number(actualCost);
    await booking.save();

    const recipient = req.user.role === 'mechanic' ? booking.customer : booking.mechanic;
    await Notification.create({
      recipient,
      type: 'booking',
      title: 'Booking Status Updated',
      message: message
    ? `Your booking status has been updated to: ${status}. ${message}`
    : `Your booking status has been updated to: ${status}`,
  relatedId: booking._id,
  relatedModel: 'Booking'
});

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customer.toString() === req.user.id;
    const isMechanic = booking.mechanic.toString() === req.user.id;
    if (!isCustomer && !isMechanic && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = 'cancelled';
    await booking.save();

    const recipient = isCustomer ? booking.mechanic : booking.customer;
    await Notification.create({
      recipient,
      type: 'booking',
      title: 'Booking Cancelled',
      message: 'The booking has been cancelled',
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('mechanic', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
