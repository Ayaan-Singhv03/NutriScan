const { auth } = require('../config/firebase');
const { User, Profile } = require('../models/relations');

const authController = {
    // POST /auth/login
    login: async (req, res) => {
        try {
            console.log('🔐 Login attempt started');
            const { token } = req.body;

            if (!token) {
                console.log('❌ No token provided');
                return res.status(400).json({ 
                    error: 'Firebase token is required' 
                });
            }

            console.log('🔍 Verifying Firebase token...');
            // Verify the Firebase token
            const decodedToken = await auth.verifyIdToken(token);
            console.log('✅ Token verified successfully');
            
            const { uid, email, name, picture } = decodedToken;
            console.log('👤 Decoded user info:', { uid, email, name, picture });

            console.log('🔍 === PROFILE CHECK DURING SIGN-IN ===');
            console.log('🔍 Searching for user with Firebase UID:', uid);
            
            // Step 1: Find the user
            let user = await User.findOne({ 
                where: { firebase_uid: uid }
            });

            console.log('🔍 User lookup result:', {
                userExists: !!user,
                userId: user?.id,
                userEmail: user?.email
            });

            let isNewUser = false;

            // Step 2: If user doesn't exist, create new user
            if (!user) {
                console.log('🆕 === CREATING NEW USER ===');
                user = await User.create({
                    firebase_uid: uid,
                    email: email,
                    name: name || email.split('@')[0],
                    pictureUrl: picture || null
                });
                isNewUser = true; // New user needs onboarding
                console.log('✅ New user created:', {
                    id: user.id,
                    firebase_uid: user.firebase_uid,
                    email: user.email
                });
            } else {
                console.log('👤 === USER EXISTS - CHECKING FOR PROFILE ===');
                
                // Step 3: Check if user has a profile
                const existingProfile = await Profile.findOne({
                    where: { userId: user.id }
                });

                console.log('🔍 Profile lookup result:', {
                    profileExists: !!existingProfile,
                    profileId: existingProfile?.id,
                    profileUserId: existingProfile?.userId,
                    profileDetails: existingProfile ? {
                        age: existingProfile.age,
                        gender: existingProfile.gender,
                        height: existingProfile.height,
                        weight: existingProfile.weight,
                        activityLevel: existingProfile.activityLevel
                    } : null
                });

                if (existingProfile) {
                    console.log('✅ === PROFILE FOUND - USER GOES TO HOME PAGE ===');
                    isNewUser = false; // User has profile = go to home
                } else {
                    console.log('❌ === NO PROFILE FOUND - USER NEEDS ONBOARDING ===');
                    isNewUser = true; // User exists but no profile = needs onboarding
                }
                
                // Update user info if it has changed
                const updates = {};
                if (user.email !== email) updates.email = email;
                if (user.name !== name && name) updates.name = name;
                if (user.pictureUrl !== picture && picture) updates.pictureUrl = picture;

                if (Object.keys(updates).length > 0) {
                    await user.update(updates);
                    console.log('🔄 User info updated:', updates);
                }
            }

            console.log('🎯 === FINAL DECISION ===');
            console.log('🎯 isNewUser:', isNewUser);
            console.log('🎯 User will be redirected to:', isNewUser ? 'ONBOARDING' : 'HOME PAGE');
            console.log('🎯 ========================');

            // Return user data (without sensitive info)
            res.status(200).json({
                message: 'Login successful',
                isNewUser: isNewUser,
                user: {
                    id: user.id,
                    firebase_uid: user.firebase_uid,
                    email: user.email,
                    name: user.name,
                    pictureUrl: user.pictureUrl,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            
            if (error.code === 'auth/id-token-expired') {
                return res.status(401).json({ 
                    error: 'Token expired. Please login again.' 
                });
            }
            
            if (error.code === 'auth/invalid-id-token') {
                return res.status(401).json({ 
                    error: 'Invalid token. Please provide a valid Firebase token.' 
                });
            }

            res.status(500).json({ 
                error: 'Login failed. Please try again.' 
            });
        }
    },

    // GET /auth/me (get current user)
    getMe: async (req, res) => {
        try {
            const user = await User.findOne({ 
                where: { firebase_uid: req.user.uid },
                attributes: { exclude: ['firebase_uid'] } // Don't expose firebase_uid
            });

            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found' 
                });
            }

            res.status(200).json({ user });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch user data' 
            });
        }
    },

    // GET /auth/debug - Debug endpoint to list all users and profiles
    debug: async (req, res) => {
        try {
            // Get all users with their profiles
            const users = await User.findAll({
                include: [{
                    model: Profile,
                    required: false
                }],
                order: [['createdAt', 'DESC']],
                limit: 20
            });

            // Get all profiles separately 
            const allProfiles = await Profile.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'email', 'firebase_uid']
                }],
                order: [['createdAt', 'DESC']]
            });

            const debugData = users.map(user => ({
                id: user.id,
                firebase_uid: user.firebase_uid,
                email: user.email,
                name: user.name,
                hasProfile: !!user.Profile,
                profileId: user.Profile?.id,
                profileData: user.Profile ? {
                    age: user.Profile.age,
                    gender: user.Profile.gender,
                    height: user.Profile.height,
                    weight: user.Profile.weight
                } : null,
                createdAt: user.createdAt
            }));

            const profileData = allProfiles.map(profile => ({
                id: profile.id,
                userId: profile.userId,
                userEmail: profile.User?.email,
                userFirebaseUid: profile.User?.firebase_uid,
                age: profile.age,
                gender: profile.gender,
                createdAt: profile.createdAt
            }));

            res.status(200).json({
                summary: {
                    totalUsers: users.length,
                    totalProfiles: allProfiles.length,
                    usersWithProfiles: users.filter(u => u.Profile).length,
                    usersWithoutProfiles: users.filter(u => !u.Profile).length
                },
                usersWithProfiles: debugData,
                allProfiles: profileData,
                lastUpdate: new Date().toISOString()
            });
        } catch (error) {
            console.error('Debug endpoint error:', error);
            res.status(500).json({ 
                error: 'Debug failed',
                details: error.message
            });
        }
    }
};

module.exports = authController; 