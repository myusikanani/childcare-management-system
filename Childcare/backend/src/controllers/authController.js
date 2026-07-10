const User = require('../models/User');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getCaretakerRequirements } = require('./settingsController');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const ADMIN_SECRET = 'ADMIN2024';

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role, phone, address, bio, experience, hourlyRate, specializations, adminSecret } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      let finalRole = role || 'user';
      
      // Handle admin registration
      if (role === 'admin') {
        if (adminSecret !== ADMIN_SECRET) {
          return res.status(403).json({ message: 'Invalid admin secret code' });
        }
      }

      // Handle caretaker registration
      const requirements = await getCaretakerRequirements();
      
      if (role === 'caretaker') {
        if (requirements.requirePhoto && !req.file) {
          return res.status(400).json({ message: 'Profile picture is required for caretakers' });
        }
        
        if (requirements.requireCert) {
          const certifications = req.body.certifications ? JSON.parse(req.body.certifications) : [];
          if (!certifications || certifications.length === 0) {
            return res.status(400).json({ message: 'At least one certification is required for caretakers' });
          }
        }
        
        if (requirements.minExperience > 0) {
          const exp = parseInt(experience) || 0;
          if (exp < requirements.minExperience) {
            return res.status(400).json({ message: `Minimum ${requirements.minExperience} years of experience is required` });
          }
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        phone: phone || '',
        address: address || '',
        avatar: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      if (finalRole === 'caretaker') {
        userData.bio = bio || '';
        userData.experience = parseInt(experience) || 0;
        userData.hourlyRate = parseFloat(hourlyRate) || 0;
        userData.specializations = specializations ? JSON.parse(specializations) : [];
        userData.isVerified = false;
        userData.isRejected = false;
      }

      const user = new User(userData);
      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Validate selected role matches the account's actual role
      if (role && role !== user.role) {
        const roleLabels = { user: 'Parent', caretaker: 'Caretaker', admin: 'Admin' };
        return res.status(403).json({ message: `This account is registered as ${roleLabels[user.role] || user.role}. Please select the correct role.` });
      }

      // Check if 2FA is required by admin
      const Settings = require('../models/Settings');
      const require2FA = await Settings.getValue('require2FA', false);
      
      // If 2FA is required but user hasn't enabled it
      if (require2FA && !user.is2FAEnabled) {
        return res.json({
          requires2FASetup: true,
          userId: user._id,
          message: '2FA is required by admin. Please enable 2FA to continue.'
        });
      }

      // If user has 2FA enabled, require OTP
      if (user.is2FAEnabled) {
        return res.json({
          requires2FA: true,
          userId: user._id,
          message: 'Please enter your 2FA code'
        });
      }

      // No 2FA, proceed with normal login
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          hourlyRate: user.hourlyRate,
          bio: user.bio,
          experience: user.experience,
          is2FAEnabled: user.is2FAEnabled,
          isVerified: user.isVerified,
          parentPhoto: user.parentPhoto || '',
          fatherPhoto: user.fatherPhoto || '',
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};
      
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      const users = await User.find(query).select('-password').sort({ createdAt: -1 });
      res.json({ users, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', success: false });
    }
  },

  // Get all caretakers
  getAllCaretakers: async (req, res) => {
    try {
      const caretakers = await User.find({ role: 'caretaker' })
        .select('-password')
        .sort({ createdAt: -1 });
      res.json(caretakers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch caretakers' });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const updateData = { ...req.body };
      delete updateData.password;

      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  },

  // Reset user password
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to reset password' });
    }
  },

  // Verify caretaker
  verifyCaretaker: async (req, res) => {
    try {
      const caretaker = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'caretaker' },
        { isVerified: true, isRejected: false },
        { new: true }
      ).select('-password');

      if (!caretaker) {
        return res.status(404).json({ message: 'Caretaker not found' });
      }

      res.json(caretaker);
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify caretaker' });
    }
  },

  // Reject caretaker
  rejectCaretaker: async (req, res) => {
    try {
      const caretaker = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'caretaker' },
        { isVerified: false, isRejected: true },
        { new: true }
      ).select('-password');

      if (!caretaker) {
        return res.status(404).json({ message: 'Caretaker not found' });
      }

      res.json(caretaker);
    } catch (error) {
      res.status(500).json({ message: 'Failed to reject caretaker' });
    }
  },

  // Verify 2FA during login
  verifyLogin2FA: async (req, res) => {
    try {
      const { userId, token, backupCode } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.twoFASecret) {
        return res.status(400).json({ message: '2FA not setup for this user' });
      }

      const speakeasy = require('speakeasy');

      // Try OTP first
      if (token) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFASecret,
          encoding: 'base32',
          token: token,
          window: 1
        });

        if (verified) {
          const jwt = require('jsonwebtoken');
          const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.json({
            success: true,
            message: '2FA verified',
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              phone: user.phone,
              hourlyRate: user.hourlyRate,
              bio: user.bio,
              experience: user.experience,
              is2FAEnabled: user.is2FAEnabled,
              isVerified: user.isVerified,
              isRejected: user.isRejected,
              rating: user.rating,
            }
          });
        }
      }

      // Try backup code
      if (backupCode && user.twoFABackupCodes) {
        const backupIndex = user.twoFABackupCodes.findIndex(
          b => b.code === backupCode.toUpperCase() && !b.used
        );

        if (backupIndex !== -1) {
          user.twoFABackupCodes[backupIndex].used = true;
          await user.save();

          const jwt = require('jsonwebtoken');
          const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.json({
            success: true,
            message: '2FA verified (backup code used)',
            token,
            usedBackupCode: true,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
            }
          });
        }
      }

      res.status(400).json({ message: 'Invalid OTP or backup code' });
    } catch (error) {
      console.error('2FA verify error:', error);
      res.status(500).json({ message: '2FA verification failed' });
    }
  },

  // Update caretaker pricing
  updateCaretakerPricing: async (req, res) => {
    try {
      const { hourlyRate, specializations, availability } = req.body;

      const updateData = {};
      if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate);
      if (specializations) updateData.specializations = specializations;
      if (availability) updateData.availability = availability;

      const caretaker = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'caretaker' },
        updateData,
        { new: true }
      ).select('-password');

      if (!caretaker) {
        return res.status(404).json({ message: 'Caretaker not found' });
      }

      res.json(caretaker);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update pricing' });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const updateData = { ...req.body };
      delete updateData.password;
      delete updateData.role;

      // Build the update object
      const setData = { ...updateData };
      
      // Handle file uploads
      if (req.file) {
        setData.avatar = `/uploads/${req.file.filename}`;
      }

      // Handle multiple file uploads
      if (req.files) {
        req.files.forEach(file => {
          if (file.fieldname === 'parentPhoto') {
            setData.parentPhoto = `/uploads/${file.filename}`;
          } else if (file.fieldname === 'fatherPhoto') {
            setData.fatherPhoto = `/uploads/${file.filename}`;
          } else if (file.fieldname === 'avatar') {
            setData.avatar = `/uploads/${file.filename}`;
          } else if (file.fieldname.startsWith('childPhoto_')) {
            const childIndex = parseInt(file.fieldname.split('_')[1]);
            setData[`children.${childIndex}.photo`] = `/uploads/${file.filename}`;
          }
        });
      }

      // Handle children array from form data
      if (updateData.children && typeof updateData.children === 'string') {
        setData.children = JSON.parse(updateData.children);
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: setData },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({ user });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
};

module.exports = authController;
