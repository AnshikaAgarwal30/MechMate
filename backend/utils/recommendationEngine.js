/**
 * MechMate Intelligent Mechanic Recommendation & Ranking Engine
 * Fully dynamic multi-factor scoring based on actual data:
 * 1. Proximity / Distance (Haversine formula between actual customer and mechanic coordinates)
 * 2. Issue Type & Specialization Match
 * 3. Customer Ratings & Review Count
 * 4. Years of Experience
 * 5. Dynamic Explainability Generator ("Why Recommended")
 */

// Mapping of breakdown issue types to synonymous / relevant specializations
const SPECIALIZATION_MAP = {
  engine: ['engine', 'engine repair', 'motor', 'mechanical', 'powertrain', 'diagnostics', 'overhaul', 'transmission'],
  battery: ['battery', 'electrical', 'auto electrician', 'starter', 'alternator', 'electronics', 'wiring', 'jump start'],
  tire: ['tire', 'tyre', 'flat tire', 'wheel', 'wheel alignment', 'puncture', 'suspension'],
  fuel: ['fuel', 'fuel delivery', 'fuel system', 'injector', 'fuel pump', 'mechanical'],
  accident: ['towing', 'bodywork', 'chassis', 'collision', 'dent removal', 'mechanical', 'recovery'],
  other: ['general', 'all-round', 'inspection', 'mechanical', 'maintenance']
};

/**
 * Validates whether a coordinate pair is a real, non-zero GeoJSON [longitude, latitude] point.
 * @param {Array<number>} coords [longitude, latitude]
 * @returns {boolean}
 */
function isValidCoordinatePair(coords) {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lon, lat] = coords.map(Number);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;
  if (lon === 0 && lat === 0) return false; // Null Island / default placeholder
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in km (2 decimal places)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Estimates driving arrival time in minutes assuming 30 km/h average city traffic.
 * @param {number} distanceKm
 * @returns {number} Estimated minutes
 */
function estimateEtaMinutes(distanceKm) {
  if (!Number.isFinite(distanceKm)) return null;
  const avgSpeedKmH = 30;
  const minutes = Math.round((distanceKm / avgSpeedKmH) * 60);
  return Math.max(3, minutes); // Minimum 3 minutes
}

/**
 * Evaluates how well a mechanic's actual specializations match the breakdown issue
 * and any AI-recommended specializations.
 */
function evaluateSpecializationMatch(mechanicSpecs = [], issueType = 'other', aiRecommendedSpecs = []) {
  const normalizedMechSpecs = mechanicSpecs.map(s => String(s).toLowerCase().trim());
  const targetTokens = new Set();

  // Add issue synonyms
  const synonyms = SPECIALIZATION_MAP[String(issueType).toLowerCase()] || SPECIALIZATION_MAP.other;
  synonyms.forEach(s => targetTokens.add(s));

  // Add AI recommended specializations
  aiRecommendedSpecs.forEach(s => targetTokens.add(String(s).toLowerCase().trim()));

  const matched = [];
  for (const spec of normalizedMechSpecs) {
    for (const token of targetTokens) {
      if (spec.includes(token) || token.includes(spec)) {
        if (!matched.includes(spec)) matched.push(spec);
      }
    }
  }

  if (matched.length > 0) {
    return { score: 100, matched, matchLevel: 'High' };
  } else if (normalizedMechSpecs.some(s => s.includes('general') || s.includes('all') || s.includes('mechanic'))) {
    return { score: 65, matched: ['General Automotive'], matchLevel: 'Moderate' };
  } else {
    return { score: 30, matched: [], matchLevel: 'Basic' };
  }
}

/**
 * Dynamically generates human-readable explainability bullet points
 * based entirely on the mechanic's actual attributes and calculated distance.
 */
function generateRecommendationReasons(mechanic, distanceKm, etaMinutes, specMatch, ratingScore, expScore) {
  const reasons = [];

  // 1. Distance & ETA (Only shown when actual distance exists)
  if (distanceKm !== null && distanceKm !== undefined) {
    if (distanceKm <= 3) {
      reasons.push(`📍 Very close: ${distanceKm} km away (~${etaMinutes} mins estimated arrival)`);
    } else if (distanceKm <= 15) {
      reasons.push(`📍 Within service range: ${distanceKm} km away (~${etaMinutes} mins drive)`);
    } else if (distanceKm <= 40) {
      reasons.push(`📍 Extended service area: ${distanceKm} km away (~${etaMinutes} mins drive)`);
    } else {
      reasons.push(`📍 Located ${distanceKm} km away`);
    }
  } else {
    reasons.push(`📍 Distance unavailable (Valid GPS coordinates not provided)`);
  }

  // 2. Specialization Match
  if (specMatch.matched.length > 0 && specMatch.matchLevel === 'High') {
    const formatted = specMatch.matched.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
    reasons.push(`🎯 Specialization match: Certified in ${formatted}`);
  } else if (specMatch.matchLevel === 'Moderate') {
    reasons.push(`🛠️ Versatile mechanic capable of general roadside repairs`);
  }

  // 3. Ratings
  const rating = mechanic.mechanicDetails?.rating || 0;
  const totalReviews = mechanic.mechanicDetails?.totalReviews || 0;
  if (rating >= 4.5 && totalReviews > 0) {
    reasons.push(`⭐ Top rated: ${rating.toFixed(1)}/5 stars from ${totalReviews} customer reviews`);
  } else if (rating >= 3.8 && totalReviews > 0) {
    reasons.push(`⭐ Positive track record: ${rating.toFixed(1)}/5 stars (${totalReviews} reviews)`);
  } else if (totalReviews === 0) {
    reasons.push(`✨ Verified active service professional`);
  }

  // 4. Experience
  const exp = mechanic.mechanicDetails?.experience || 0;
  if (exp >= 8) {
    reasons.push(`💼 Veteran mechanic with ${exp}+ years of hands-on automotive repair`);
  } else if (exp >= 3) {
    reasons.push(`🔧 Experienced technician with ${exp} years in automotive service`);
  }

  // 5. Availability
  if (mechanic.mechanicDetails?.isAvailable) {
    reasons.push(`⚡ Currently on-duty and available for instant response`);
  }

  return reasons;
}

/**
 * Core Dynamic Ranking Algorithm:
 * Scores candidate mechanics and sorts them dynamically.
 * 
 * @param {Array} mechanics List of mechanic user documents
 * @param {Array<number>} customerCoords [longitude, latitude]
 * @param {string} issueType Breakdown issue type
 * @param {Array<string>} aiRecommendedSpecs Specializations recommended by AI diagnosis
 * @param {number} maxRadiusKm Maximum search radius in km (default: 40)
 * @returns {Array} Ranked mechanics with dynamic scores and explanations
 */
function rankMechanics(mechanics, customerCoords, issueType = 'other', aiRecommendedSpecs = [], maxRadiusKm = 40) {
  const hasValidCustomerCoords = isValidCoordinatePair(customerCoords);
  const [custLon, custLat] = hasValidCustomerCoords ? customerCoords.map(Number) : [0, 0];

  const scoredMechanics = mechanics
    .map(mechanic => {
    const mechCoords = mechanic.address?.location?.coordinates;
    const hasValidMechCoords = isValidCoordinatePair(mechCoords);
    const [mechLon, mechLat] = hasValidMechCoords ? mechCoords.map(Number) : [0, 0];

    // Calculate actual distance only if BOTH coordinates are valid
    let distanceKm = null;
    let etaMinutes = null;
    let distScore = 50; // Neutral baseline when distance is unavailable

    if (hasValidCustomerCoords && hasValidMechCoords) {
      distanceKm = calculateDistance(custLat, custLon, mechLat, mechLon);
      etaMinutes = estimateEtaMinutes(distanceKm);

      // Scale distance score smoothly (0 km = 100, 35 km ≈ 15, >40 km decays to 0)
      if (distanceKm <= maxRadiusKm) {
        distScore = Math.max(10, Math.min(100, Math.round(100 - (distanceKm * 2.4))));
      } else {
        distScore = Math.max(0, Math.round(100 - (distanceKm * 3.0)));
      }
    }

    // Specialization Match Score (30% weight)
    const specResult = evaluateSpecializationMatch(
      mechanic.mechanicDetails?.specialization || [],
      issueType,
      aiRecommendedSpecs
    );
    const specScore = specResult.score;

    // Rating Score (20% weight)
    const rating = Number(mechanic.mechanicDetails?.rating) || 0;
    const totalReviews = Number(mechanic.mechanicDetails?.totalReviews) || 0;
    const ratingScore = totalReviews > 0 ? Math.round((rating / 5.0) * 100) : 70; // 70 baseline for new

    // Experience Score (15% weight)
    const exp = Number(mechanic.mechanicDetails?.experience) || 0;
    let expScore = 40;
    if (exp >= 10) expScore = 100;
    else if (exp >= 6) expScore = 85;
    else if (exp >= 3) expScore = 70;
    else if (exp >= 1) expScore = 55;

    // Composite Weighted Score (100% dynamically calculated)
    const compositeScore = Math.round(
      (distScore * 0.35) +
      (specScore * 0.30) +
      (ratingScore * 0.20) +
      (expScore * 0.15)
    );

    const reasons = generateRecommendationReasons(
      mechanic,
      distanceKm,
      etaMinutes,
      specResult,
      ratingScore,
      expScore
    );

    return {
      _id: mechanic._id,
      name: mechanic.name,
      email: mechanic.email,
      phone: mechanic.phone,
      avatar: mechanic.avatar,
      address: mechanic.address,
      mechanicDetails: mechanic.mechanicDetails,
      distanceKm: distanceKm,
      estimatedEtaMinutes: etaMinutes,
      matchScore: Math.min(99, Math.max(20, compositeScore)),
      matchLevel: specResult.matchLevel,
      matchedSpecializations: specResult.matched,
      recommendationReasons: reasons
    };
  })
  // Recommendations are only meaningful when the mechanic has a valid location
  // within the configured service radius. This prevents distant mechanics from
  // appearing in a supposedly nearby recommendation list.
  .filter(mechanic => mechanic.distanceKm !== null && mechanic.distanceKm <= maxRadiusKm);

  // Sort descending by matchScore; tie-break by lowest distance
  scoredMechanics.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    const distA = a.distanceKm !== null ? a.distanceKm : 9999;
    const distB = b.distanceKm !== null ? b.distanceKm : 9999;
    return distA - distB;
  });

  return scoredMechanics;
}

module.exports = {
  isValidCoordinatePair,
  calculateDistance,
  estimateEtaMinutes,
  evaluateSpecializationMatch,
  generateRecommendationReasons,
  rankMechanics
};
