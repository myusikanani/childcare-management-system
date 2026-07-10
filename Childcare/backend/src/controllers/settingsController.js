const Settings = require('../models/Settings');

const DEFAULT_SETTINGS = {
  // Caretaker Requirements
  caretakerRequirePhoto: true,
  caretakerRequireCertification: false,
  caretakerMinExperience: 0,
  
  // Platform Settings
  platformCommission: 10,
  minimumPayout: 500,
  currency: 'INR',
  currencySymbol: '₹',
  
  // Booking Settings
  cancellationHoursBefore: 24,
  allowCancellation: true,
  refundPercentage: 100,
  
  // Security
  adminSecretCode: 'ADMIN2024',
  sessionTimeout: 60,
  require2FA: false,
  
  // System
  maintenanceMode: false,
  emailAlerts: true,
  lowBalanceAlert: true,
  lowBalanceThreshold: 10000,
  
  // Payment
  paymentGateway: 'razorpay',
  razorpayKey: '',
  razorpaySecret: '',
};

exports.initializeSettings = async () => {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await Settings.setValue(key, value);
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getAll();
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    res.json({ success: true, settings: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      if (key in DEFAULT_SETTINGS) {
        await Settings.setValue(key, value);
      }
    }
    const settings = await Settings.getAll();
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    res.json({ success: true, message: 'Settings updated', settings: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

exports.getCaretakerRequirements = async () => {
  const requirePhoto = await Settings.getValue('caretakerRequirePhoto', true);
  const requireCert = await Settings.getValue('caretakerRequireCertification', false);
  const minExperience = await Settings.getValue('caretakerMinExperience', 0);
  return { requirePhoto, requireCert, minExperience };
};

exports.getPlatformCommission = async () => {
  return await Settings.getValue('platformCommission', 10);
};

exports.getMaintenanceMode = async () => {
  return await Settings.getValue('maintenanceMode', false);
};

exports.getCancellationPolicy = async () => {
  const hours = await Settings.getValue('cancellationHoursBefore', 24);
  const allow = await Settings.getValue('allowCancellation', true);
  const refund = await Settings.getValue('refundPercentage', 100);
  return { hours, allow, refundPercentage: refund };
};

exports.backupDatabase = async (req, res) => {
  try {
    const User = require('../models/User');
    const Booking = require('../models/Booking');
    const Notification = require('../models/Notification');
    const Message = require('../models/Message');
    
    const [users, bookings, notifications, messages, settings] = await Promise.all([
      User.find({}).lean(),
      Booking.find({}).lean(),
      Notification.find({}).lean(),
      Message.find({}).lean(),
      Settings.find({}).lean(),
    ]);
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        bookings,
        notifications,
        messages,
        settings,
      }
    };
    
    res.json({ success: true, backup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Backup failed' });
  }
};

exports.clearCache = async (req, res) => {
  try {
    const User = require('../models/User');
    await User.find({}).cache && delete User.find({}).cache;
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cache' });
  }
};
