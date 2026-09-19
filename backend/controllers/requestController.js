const Request = require('../models/Request');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { rankMechanics, isValidCoordinatePair } = require('../utils/recommendationEngine');


// ======================================================
// CREATE REQUEST
// ======================================================
exports.createRequest = async (req, res) => {
  try {
    const {
      vehicle,
      location,
      issueType,
      description,
      urgency,
      images,
      aiDiagnosis
    } = req.body;

    // Validate location
    if (
      !location?.address ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid location address and coordinates are required.'
      });
    }

    const coordinates = location.coordinates.map(Number);

    if (
      coordinates.some(value => !Number.isFinite(value)) ||
      coordinates[0] < -180 ||
      coordinates[0] > 180 ||
      coordinates[1] < -90 ||
      coordinates[1] > 90
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location coordinates.'
      });
    }

    // Create request
    const request = await Request.create({
      customer: req.user.id,
      vehicle,

      location: {
        type: 'Point',
        coordinates,
        address: location.address
      },

      issueType,
      description,
      urgency,
      images: images || [],
      aiDiagnosis: aiDiagnosis || undefined
    });

    // Add timeline
    request.timeline.push({
      status: 'pending',
      message: 'Breakdown request created',
      timestamp: new Date()
    });

    await request.save();

    // Find nearby mechanics safely
    let nearbyMechanics = [];
    try {
      nearbyMechanics = await User.find({
        role: 'mechanic',
        'mechanicDetails.isVerified': true,
        'mechanicDetails.isAvailable': true,
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: 25000
          }
        }
      });
    } catch (geoErr) {
      console.warn('Geospatial near query notice, fallback to available mechanics:', geoErr.message);
      nearbyMechanics = await User.find({
        role: 'mechanic',
        'mechanicDetails.isVerified': true,
        'mechanicDetails.isAvailable': true
      }).limit(5);
    }

    // Notify nearby mechanics
    for (const mechanic of nearbyMechanics) {
      await Notification.create({
        recipient: mechanic._id,
        type: 'request',
        title: 'New Breakdown Request',
        message: `A new ${urgency} priority request is available nearby.`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    // Notify all admins about new breakdown request
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        type: 'request',
        title: 'New Breakdown Request',
        message: `Customer ${req.user.name || req.user.id} created a new ${urgency} priority request.`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    res.status(201).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Create request error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET CUSTOMER / MECHANIC REQUESTS
// ======================================================
exports.getRequests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'mechanic') {
      query.assignedMechanic = req.user.id;
    }

    const requests = await Request.find(query)
      .populate('customer', 'name phone email')
      .populate(
        'assignedMechanic',
        'name phone email mechanicDetails'
      )
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get requests error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET REQUEST BY ID
// ======================================================
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate(
        'assignedMechanic',
        'name phone email mechanicDetails'
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      request.customer._id.toString() !== req.user.id &&
      request.assignedMechanic?._id?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Get request by ID error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET AVAILABLE REQUESTS
// ======================================================
exports.getAvailableRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      status: 'pending',
      assignedMechanic: null
    })
      .populate('customer', 'name phone email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get available requests error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// ACCEPT REQUEST
// ======================================================
exports.acceptRequest = async (req, res) => {
  try {
    const {
      estimatedArrival,
      estimatedCost
    } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not available for acceptance'
      });
    }

    // Assign mechanic
    request.assignedMechanic = req.user.id;
    request.status = 'accepted';
    request.estimatedArrival = estimatedArrival;
    request.estimatedCost = estimatedCost;

    // Timeline
    request.timeline.push({
      status: 'accepted',
      message: `Request accepted by mechanic ${req.user.name}`,
      timestamp: new Date()
    });

    await request.save();

    // ==================================================
    // CUSTOMER NOTIFICATION
    // ==================================================
    await Notification.create({
      recipient: request.customer,
      type: 'request',
      title: 'Mechanic Assigned',
      message: `Your breakdown request has been accepted by a mechanic. ETA: ${estimatedArrival || 'Not specified'}. Estimated cost: ₹${estimatedCost || 'Not specified'}.`,
      relatedId: request._id,
      relatedModel: 'Request'
    });

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Accept request error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// UPDATE REQUEST STATUS
// ======================================================
exports.updateRequestStatus = async (req, res) => {
  try {
    const {
      status,
      message,
      actualCost
    } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check assigned mechanic
    const isAssignedMechanic =
      request.assignedMechanic?.toString() === req.user.id;

    if (req.user.role !== 'admin' && !isAssignedMechanic) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned mechanic can update this request'
      });
    }

    // Allowed statuses
    const allowedStatuses = [
      'accepted',
      'in_progress',
      'completed'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request status'
      });
    }

    // Update status
    request.status = status;

    // Add timeline
    request.timeline.push({
      status,
      message: message || `Status updated to ${status}`,
      timestamp: new Date()
    });

    // Actual cost when completed
    if (
      status === 'completed' &&
      actualCost !== undefined &&
      actualCost !== ''
    ) {
      request.actualCost = Number(actualCost);
    }

    await request.save();

    // Notify admins about request completion
    if (status === 'completed') {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          type: 'request',
          title: 'Request Completed',
          message: `Request ${request._id} has been completed. Actual cost: ₹${request.actualCost || 'N/A'}.`,
          relatedId: request._id,
          relatedModel: 'Request'
        });
      }
    }

    // ==================================================
    // CUSTOMER NOTIFICATION
    // ==================================================
    const notificationMessage = message
      ? `Your request status has been updated to: ${status}. ${message}`
      : `Your request status has been updated to: ${status}`;

    await Notification.create({
      recipient: request.customer,
      type: 'request',
      title: 'Request Status Updated',
      message: notificationMessage,
      relatedId: request._id,
      relatedModel: 'Request'
    });

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Update request status error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// CANCEL REQUEST
// ======================================================
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed request'
      });
    }

    request.status = 'cancelled';

    request.timeline.push({
      status: 'cancelled',
      message: 'Request cancelled by customer',
      timestamp: new Date()
    });

    await request.save();

    // Notify mechanic
    if (request.assignedMechanic) {
      await Notification.create({
        recipient: request.assignedMechanic,
        type: 'request',
        title: 'Request Cancelled',
        message: 'The customer has cancelled the breakdown request',
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Cancel request error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET ALL REQUESTS - ADMIN
// ======================================================
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('customer', 'name email phone')
      .populate('assignedMechanic', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get all requests error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET RECOMMENDED MECHANICS (INTELLIGENT RANKING)
// ======================================================
exports.getRecommendedMechanics = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only request owner or admin can get recommendations
    if (req.user.role !== 'admin' && request.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to get recommendations'
      });
    }

    const coordinates = request.location?.coordinates;

    if (!isValidCoordinatePair(coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Request location is not valid'
      });
    }

    // Find all verified and available mechanics
    const mechanics = await User.find({
      role: 'mechanic',
      'mechanicDetails.isVerified': true,
      'mechanicDetails.isAvailable': true
    }).select('name phone email avatar address mechanicDetails');

    const recommendedSpecializations = request.aiDiagnosis?.recommendedSpecialization || [];

    // Run multi-factor recommendation & ranking algorithm
    const rankedMechanics = rankMechanics(
      mechanics,
      coordinates,
      request.issueType,
      recommendedSpecializations,
      40 // 40 km max search radius
    );

    res.status(200).json({
      success: true,
      count: rankedMechanics.length,
      mechanics: rankedMechanics
    });

  } catch (error) {
    console.error('Get recommended mechanics error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};