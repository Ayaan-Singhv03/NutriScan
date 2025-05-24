const { Profile, User } = require('../models/relations');

// Helper function to calculate BMI
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100; // Convert cm to meters
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

const profileController = {
  // POST /api/profile - Create user profile
  createProfile: async (req, res) => {
    try {
      console.log('📝 Creating profile for user:', req.user.uid);
      const { age, gender, height, weight, activityLevel, goalType } = req.body;
      console.log('📝 Profile data received:', { age, gender, height, weight, activityLevel, goalType });
      
      // Get user from database
      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        console.log('❌ User not found in database');
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      console.log('👤 User found:', user.id);

      // Check if profile already exists
      const existingProfile = await Profile.findOne({ 
        where: { userId: user.id } 
      });

      if (existingProfile) {
        console.log('❌ Profile already exists');
        return res.status(400).json({ 
          error: 'Profile already exists. Use PUT to update.' 
        });
      }

      // Calculate BMI automatically
      const calculatedBMI = calculateBMI(weight, height);
      console.log('🧮 Calculated BMI:', calculatedBMI);

      // Create new profile (excluding goalType as it belongs to DailyGoal)
      console.log('💾 Creating profile in database...');
      const profile = await Profile.create({
        userId: user.id,
        age,
        gender,
        height,
        weight,
        bmi: calculatedBMI,
        activityLevel
      });

      console.log('✅ Profile created successfully:', profile.id);

      res.status(201).json({
        message: 'Profile created successfully',
        profile: {
          ...profile.toJSON(),
          bmiCategory: getBMICategory(calculatedBMI)
        }
      });

    } catch (error) {
      console.error('❌ Create profile error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        errors: error.errors // Sequelize validation errors
      });
      res.status(500).json({ 
        error: 'Failed to create profile',
        details: error.message
      });
    }
  },

  // GET /api/profile - Get user's profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const profile = await Profile.findOne({ 
        where: { userId: user.id },
        include: [{
          model: User,
          attributes: ['id', 'email', 'name', 'pictureUrl']
        }]
      });

      if (!profile) {
        return res.status(404).json({ 
          error: 'Profile not found' 
        });
      }

      res.status(200).json({ 
        profile: {
          ...profile.toJSON(),
          bmiCategory: getBMICategory(profile.bmi)
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile' 
      });
    }
  },

  // PUT /api/profile - Update user's profile
  updateProfile: async (req, res) => {
    try {
      const { age, gender, height, weight, activityLevel, goalType } = req.body;
      
      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const profile = await Profile.findOne({ 
        where: { userId: user.id } 
      });

      if (!profile) {
        return res.status(404).json({ 
          error: 'Profile not found' 
        });
      }

      // Calculate new BMI if height or weight changed
      const newHeight = height !== undefined ? height : profile.height;
      const newWeight = weight !== undefined ? weight : profile.weight;
      const calculatedBMI = calculateBMI(newWeight, newHeight);

      // Update profile
      await profile.update({
        age: age !== undefined ? age : profile.age,
        gender: gender !== undefined ? gender : profile.gender,
        height: newHeight,
        weight: newWeight,
        bmi: calculatedBMI,
        activityLevel: activityLevel !== undefined ? activityLevel : profile.activityLevel,
        goalType: goalType !== undefined ? goalType : profile.goalType
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: {
          ...profile.toJSON(),
          bmiCategory: getBMICategory(calculatedBMI)
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        error: 'Failed to update profile' 
      });
    }
  },

  // DELETE /api/profile - Delete user's profile
  deleteProfile: async (req, res) => {
    try {
      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const profile = await Profile.findOne({ 
        where: { userId: user.id } 
      });

      if (!profile) {
        return res.status(404).json({ 
          error: 'Profile not found' 
        });
      }

      await profile.destroy();

      res.status(200).json({
        message: 'Profile deleted successfully'
      });

    } catch (error) {
      console.error('Delete profile error:', error);
      res.status(500).json({ 
        error: 'Failed to delete profile' 
      });
    }
  }
};

// Helper function to categorize BMI
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 18.5 && bmi < 25) return 'normal';
  if (bmi >= 25 && bmi < 30) return 'overweight';
  return 'obese';
};

module.exports = profileController; 