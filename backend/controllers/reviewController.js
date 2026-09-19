const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { mechanic, request, rating, comment } = req.body;

    const existingReview = await Review.findOne({
      customer: req.user.id,
      request
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this request'
      });
    }

    const review = await Review.create({
      customer: req.user.id,
      mechanic,
      request,
      rating,
      comment
    });

    const mechanicUser = await User.findById(mechanic);
    const totalReviews = await Review.countDocuments({ mechanic });
    const allReviews = await Review.find({ mechanic });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    mechanicUser.mechanicDetails.rating = avgRating;
    mechanicUser.mechanicDetails.totalReviews = totalReviews;
    await mechanicUser.save();

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { mechanic } = req.query;
    const query = mechanic ? { mechanic } : {};

    const reviews = await Review.find(query)
      .populate('customer', 'name avatar')
      .populate('mechanic', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('customer', 'name avatar')
      .populate('mechanic', 'name')
      .populate('request');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const { response } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.mechanic.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.response = response;
    await review.save();

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name email')
      .populate('mechanic', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const mechanicUser = await User.findById(review.mechanic);
    const totalReviews = await Review.countDocuments({ mechanic: review.mechanic });
    const allReviews = await Review.find({ mechanic: review.mechanic });
    const avgRating = totalReviews > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    mechanicUser.mechanicDetails.rating = avgRating;
    mechanicUser.mechanicDetails.totalReviews = totalReviews;
    await mechanicUser.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
