import mongoose from 'mongoose';

const defaultGradingRules = [
  { minPercentage: 90, maxPercentage: 100, grade: 'A+' },
  { minPercentage: 80, maxPercentage: 89.99, grade: 'A' },
  { minPercentage: 70, maxPercentage: 79.99, grade: 'B+' },
  { minPercentage: 60, maxPercentage: 69.99, grade: 'B' },
  { minPercentage: 50, maxPercentage: 59.99, grade: 'C' },
  { minPercentage: 40, maxPercentage: 49.99, grade: 'D' },
  { minPercentage: 0, maxPercentage: 39.99, grade: 'F' },
];

const settingsSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      default: 'Delhi Public International Academy',
    },
    schoolLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces',
    },
    schoolAddress: {
      type: String,
      default: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
    },
    schoolPhone: {
      type: String,
      default: '+91 120 4567 890',
    },
    schoolEmail: {
      type: String,
      default: 'info@dpia.edu.in',
    },
    academicSession: {
      type: String,
      default: '2025-26',
    },
    defaultPassMarkPercentage: {
      type: Number,
      default: 33,
    },
    subjectPassMark: {
      type: Number,
      default: 33,
    },
    gradingRules: {
      type: Array,
      default: defaultGradingRules,
    },
    aiSettings: {
      modelName: { type: String, default: 'rule-engine-v1' },
      enableAutoSuggestions: { type: Boolean, default: true },
    }
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings;
