const User = require('../models/User');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const twoFAController = {
  // Generate 2FA secret and QR code
  setup2FA: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Childcare:${user.email}`,
        length: 20
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push({
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          used: false
        });
      }

      // Store temp secret (not enabled yet)
      user.twoFASecret = secret.base32;
      user.twoFABackupCodes = backupCodes;
      await user.save();

      res.json({
        success: true,
        qrCode: qrCodeUrl,
        secret: secret.base32,
        backupCodes: backupCodes.map(b => b.code),
        message: '2FA setup initiated. Verify with OTP to enable.'
      });
    } catch (error) {
      console.error('2FA Setup Error:', error);
      res.status(500).json({ success: false, message: 'Failed to setup 2FA' });
    }
  },

  // Verify OTP and enable 2FA
  enable2FA: async (req, res) => {
    try {
      const { token } = req.body;
      const user = await User.findById(req.user._id);

      if (!user || !user.twoFASecret) {
        return res.status(400).json({ success: false, message: 'Please setup 2FA first' });
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: token,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
      }

      // Enable 2FA
      user.is2FAEnabled = true;
      await user.save();

      res.json({
        success: true,
        message: '2FA enabled successfully!',
        backupCodes: user.twoFABackupCodes.filter(b => !b.used).map(b => b.code)
      });
    } catch (error) {
      console.error('2FA Enable Error:', error);
      res.status(500).json({ success: false, message: 'Failed to enable 2FA' });
    }
  },

  // Disable 2FA
  disable2FA: async (req, res) => {
    try {
      const { token, password } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.is2FAEnabled) {
        return res.status(400).json({ success: false, message: '2FA is not enabled' });
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect password' });
      }

      // Verify OTP
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: token,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
      }

      // Disable 2FA
      user.is2FAEnabled = false;
      user.twoFASecret = null;
      user.twoFABackupCodes = [];
      await user.save();

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error) {
      console.error('2FA Disable Error:', error);
      res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
    }
  },

  // Get 2FA status
  get2FAStatus: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        is2FAEnabled: user.is2FAEnabled,
        backupCodesRemaining: user.twoFABackupCodes ? user.twoFABackupCodes.filter(b => !b.used).length : 0
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get 2FA status' });
    }
  },

  // Verify 2FA token (used during login)
  verify2FA: async (req, res) => {
    try {
      const { userId, token, backupCode } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.is2FAEnabled || !user.twoFASecret) {
        return res.status(400).json({ success: false, message: '2FA not enabled' });
      }

      // Try OTP first
      if (token) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFASecret,
          encoding: 'base32',
          token: token,
          window: 1
        });

        if (verified) {
          return res.json({ success: true, verified: true });
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
          return res.json({ success: true, verified: true, usedBackupCode: true });
        }
      }

      res.status(400).json({ success: false, message: 'Invalid OTP or backup code' });
    } catch (error) {
      console.error('2FA Verify Error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify 2FA' });
    }
  }
};

module.exports = twoFAController;
