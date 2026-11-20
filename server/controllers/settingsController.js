import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Settings from '../models/Settings.js';
import { isDbConnected, shouldUseFallback } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

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

const readSettingsFromFile = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[settingsController] Error reading settings.json:', err.message);
  }
  return defaultSettings;
};

const writeSettingsToFile = (settings) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[settingsController] Error writing settings.json:', err.message);
  }
};

let inMemorySettings = readSettingsFromFile();

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

    // Normalize field names if instituteName passed instead of schoolName
    const payload = { ...req.body };
    if (payload.instituteName && !payload.schoolName) {
      payload.schoolName = payload.instituteName;
    }

    if (isDbConnected()) {
      const existing = await Settings.findOne();
      if (existing) {
        settings = await Settings.findByIdAndUpdate(existing._id, payload, { new: true });
      } else {
        settings = await Settings.create(payload);
      }
    }

    // Always persist to local store as well
    inMemorySettings = { ...inMemorySettings, ...payload };
    writeSettingsToFile(inMemorySettings);

    if (!settings) {
      settings = inMemorySettings;
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
