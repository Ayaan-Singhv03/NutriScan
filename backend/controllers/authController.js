const { auth } = require('../config/firebase');
const { User } = require('../models/relations');

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

            // Check if user exists in database
            console.log('🔍 Checking if user exists...');
            let user = await User.findOne({ 
                where: { firebase_uid: uid } 
            });

            // If user doesn't exist, create new user
            if (!user) {
                console.log('🆕 Creating new user...');
                user = await User.create({
                    firebase_uid: uid,
                    email: email,
                    name: name || email.split('@')[0], // Use email prefix if name not provided
                    pictureUrl: picture || null
                });
                console.log('✅ New user created:', user.id);
            } else {
                console.log('👤 Existing user found:', user.id);
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

            console.log('🎉 Login successful');
            // Return user data (without sensitive info)
            res.status(200).json({
                message: 'Login successful',
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
    }
};

module.exports = authController; 