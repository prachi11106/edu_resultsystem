import Settings from '../models/Settings.js';
import { isDbConnected, shouldUseFallback } from '../config/db.js';

const defaultSettings = {
  schoolName: 'Delhi Public International Academy',
  schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces',
  schoolAddress: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
  schoolPhone: '+91 120 4567 890',
  schoolEmail: 'info@dpia.edu.in',
  academicSession: '2025-26',
  defaultPassMarkPercentage: 33,
  subjectPassMark: 33,
  gradingRules: [
    { minPercentage: 90, maxPercentage: 100, grade: 'A+' },
    { minPercentage: 80, maxPercentage: 89.99, grade: 'A' },
    { minPercentage: 70, maxPercentage: 79.99, grade: 'B+' },
    { minPercentage: 60, maxPercentage: 69.99, grade: 'B' },
    { minPercentage: 50, maxPercentage: 59.99, grade: 'C' },
    { minPercentage: 40, maxPercentage: 49.99, grade: 'D' },
    { minPercentage: 0, maxPercentage: 39.99, grade: 'F' },
  ],
  aiSettings: {
    modelName: 'rule-engine-v1',
    enableAutoSuggestions: true,
  },
};

let inMemorySettings = { ...defaultSettings };

// @desc Get school configuration & settings
// @route GET /api/settings
export const getSettings = async (req, res) => {
  try {
    let settings = null;

    if (isDbConnected()) {
      settings = await Settings.findOne();
      if (!settings) {
        settings = inMemorySettings;
      }
    } else if (shouldUseFallback()) {
      settings = inMemorySettings;
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please start MongoDB or set USE_MEMORY_FALLBACK=true in server/.env.',
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[getSettings Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
  }
};

// @desc Update school configuration & settings
// @route PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    let settings;

    if (isDbConnected()) {
      const existing = await Settings.findOne();
      if (existing) {
        settings = await Settings.findByIdAndUpdate(existing._id, req.body, { new: true });
      } else {
        settings = await Settings.create(req.body);
      }
    } else if (shouldUseFallback()) {
      inMemorySettings = { ...inMemorySettings, ...req.body };
      settings = inMemorySettings;
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot update settings without database.',
      });
    }

    res.json({
      success: true,
      message: 'School settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('[updateSettings Error]', error);
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
};
