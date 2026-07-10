const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingsSchema.statics.setValue = async function(key, value) {
  const setting = await this.findOneAndUpdate(
    { key },
    { key, value, updatedAt: Date.now() },
    { upsert: true, new: true }
  );
  return setting;
};

settingsSchema.statics.getAll = async function() {
  const settings = await this.find({});
  const result = {};
  settings.forEach(s => { result[s.key] = s.value; });
  return result;
};

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
