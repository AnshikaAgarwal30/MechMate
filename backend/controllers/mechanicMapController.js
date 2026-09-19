// backend/controllers/mechanicMapController.js
// Controller that returns recommended mechanics (ranked) for a given location and issue type.
// It reuses the existing recommendationEngine logic without modifying scoring.

const User = require('../models/User');
const { rankMechanics, isValidCoordinatePair } = require('../utils/recommendationEngine');

/**
 * GET /api/mechanics/recommend
 * Query params: longitude, latitude, issueType, maxResults (optional)
 */
exports.getRecommendedMechanics = async (req, res) => {
  try {
    const { longitude, latitude, issueType, maxResults = 20 } = req.query;
    if (!longitude || !latitude || !issueType) {
      return res.status(400).json({ success: false, message: 'longitude, latitude and issueType are required' });
    }

    // Fetch verified & available mechanics (same filter used elsewhere)
    const mechanics = await User.find({
      role: 'mechanic',
      'mechanicDetails.isVerified': true,
      'mechanicDetails.isAvailable': true
    }).select('-password');

    // Customer coordinates as [longitude, latitude]
    const customerCoords = [Number(longitude), Number(latitude)];
    if (!isValidCoordinatePair(customerCoords)) {
      return res.status(400).json({ success: false, message: 'Valid longitude and latitude are required' });
    }

    // Use existing ranking logic – it will compute distance, specialization match, etc.
    const ranked = rankMechanics(mechanics, customerCoords, issueType, [], 40);

    const limited = ranked.slice(0, maxResults).map(m => ({
      name: m.name,
      location: m.address?.location?.coordinates || [], // [lon, lat]
      rating: m.mechanicDetails?.rating ?? 0,
      experience: m.mechanicDetails?.experience ?? 0,
      specialization: m.mechanicDetails?.specialization ?? [],
      distanceKm: m.distanceKm,
      matchScore: m.matchScore,
      recommendationReasons: m.recommendationReasons
    }));

    res.status(200).json({ success: true, count: limited.length, mechanics: limited, customerLocation: customerCoords });
  } catch (error) {
    console.error('Error in getRecommendedMechanics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
