const User = require('../models/User');
const Notification = require('../models/Notification');

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar, mechanicDetails } = req.body;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) currentUser.name = name;
    if (phone) currentUser.phone = phone;
    if (avatar !== undefined) currentUser.avatar = avatar;

    if (address) {
      currentUser.address = {
        ...currentUser.address?.toObject?.(),
        ...address
      };
      // Ensure location format
      if (address.location && Array.isArray(address.location.coordinates)) {
        currentUser.address.location = {
          type: 'Point',
          coordinates: address.location.coordinates.map(Number)
        };
      }
    }

    if (mechanicDetails && currentUser.role === 'mechanic') {
      currentUser.mechanicDetails = {
        ...currentUser.mechanicDetails?.toObject?.(),
        ...mechanicDetails
      };
    }

    await currentUser.save();

    res.status(200).json({
      success: true,
      user: currentUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    const { make, model, year, licensePlate, vin } = req.body;

    const user = await User.findById(req.user.id);
    user.vehicleDetails.push({ make, model, year, licensePlate, vin });
    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMechanics = async (req, res) => {
  try {
    const mechanics = await User.find({
      role: 'mechanic',
      'mechanicDetails.isVerified': true,
      'mechanicDetails.isAvailable': true
    }).select('-password');

    res.status(200).json({
      success: true,
      count: mechanics.length,
      mechanics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getNearbyMechanics = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    const mechanics = await User.find({
      role: 'mechanic',
      'mechanicDetails.isVerified': true,
      'mechanicDetails.isAvailable': true,
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('-password');

    res.status(200).json({
      success: true,
      count: mechanics.length,
      mechanics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// exports.approveMechanic = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findByIdAndUpdate(
//       id,
//       { 'mechanicDetails.isVerified': true,
//         'mechanicDetails.isAvailable' : true
//        },
//       { new: true, runValidators: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     await Notification.create({
//       recipient: user._id,
//       type: 'mechanic_approval',
//       title: 'Mechanic Account Approved',
//       message: 'Your mechanic account has been approved. You can now start accepting requests.',
//       relatedId: user._id,
//       relatedModel: 'User'
//     });

//     res.status(200).json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

exports.approveMechanic = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'mechanic') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a mechanic'
      });
    }

    // Approve mechanic and make them available
    user.mechanicDetails.isVerified = true;
    user.mechanicDetails.isAvailable = true;

    await user.save();

    // Send notification to mechanic
    await Notification.create({
      recipient: user._id,
      type: 'mechanic_approval',
      title: 'Mechanic Account Approved',
      message: 'Your mechanic account has been approved. You can now start accepting requests.',
      relatedId: user._id,
      relatedModel: 'User'
    });

    res.status(200).json({
      success: true,
      message: 'Mechanic approved successfully',
      user
    });

  } catch (error) {
    console.error('Approve mechanic error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
