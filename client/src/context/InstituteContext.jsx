import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const InstituteContext = createContext();

const DEFAULT_INSTITUTE_NAME = 'Delhi Public International Academy';

export const InstituteProvider = ({ children }) => {
  const [instituteName, setInstituteName] = useState(() => {
    return localStorage.getItem('anksetu_institute_name') || DEFAULT_INSTITUTE_NAME;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('anksetu_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return {
      schoolName: DEFAULT_INSTITUTE_NAME,
      schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces',
      schoolAddress: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
      schoolPhone: '+91 120 4567 890',
      schoolEmail: 'info@dpia.edu.in',
      academicSession: '2025-26',
      defaultPassMarkPercentage: 33,
      subjectPassMark: 33,
    };
  });

  const [loading, setLoading] = useState(true);

  // Fetch settings from server on initial load
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      if (res && res.success && res.data) {
        const name = res.data.schoolName || res.data.instituteName || DEFAULT_INSTITUTE_NAME;
        setInstituteName(name);
        setSettings(res.data);
        localStorage.setItem('anksetu_institute_name', name);
        localStorage.setItem('anksetu_settings', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('[InstituteContext] Error loading settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update institute name globally and save to DB
  const updateInstituteName = async (newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) {
      return { success: false, message: 'Institute name cannot be empty.' };
    }

    // Immediately update local state for zero-lag reactivity
    setInstituteName(trimmed);
    localStorage.setItem('anksetu_institute_name', trimmed);

    try {
      const updatedPayload = {
        ...(settings || {}),
        schoolName: trimmed,
        instituteName: trimmed,
      };

      const res = await settingsAPI.update(updatedPayload);
      if (res && res.success && res.data) {
        setSettings(res.data);
        localStorage.setItem('anksetu_settings', JSON.stringify(res.data));
        return { success: true, data: res.data };
      }
      return { success: true };
    } catch (err) {
      console.error('[InstituteContext] Error updating institute name on server:', err);
      return { success: false, message: err.message || 'Failed to update institute name on server' };
    }
  };

  // Full settings update
  const updateAllSettings = async (newSettingsObj) => {
    try {
      const payload = { ...newSettingsObj };
      if (payload.schoolName) {
        payload.instituteName = payload.schoolName;
      } else if (payload.instituteName) {
        payload.schoolName = payload.instituteName;
      }

      // Optimistically update name
      const targetName = payload.schoolName || payload.instituteName || instituteName;
      setInstituteName(targetName);
      localStorage.setItem('anksetu_institute_name', targetName);

      const res = await settingsAPI.update(payload);
      if (res && res.success && res.data) {
        setSettings(res.data);
        const savedName = res.data.schoolName || res.data.instituteName || targetName;
        setInstituteName(savedName);
        localStorage.setItem('anksetu_institute_name', savedName);
        localStorage.setItem('anksetu_settings', JSON.stringify(res.data));
        return { success: true, data: res.data };
      }
      return { success: false, message: res?.message || 'Update failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Update failed' };
    }
  };

  return (
    <InstituteContext.Provider
      value={{
        instituteName,
        settings,
        loading,
        updateInstituteName,
        updateAllSettings,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </InstituteContext.Provider>
  );
};

export const useInstitute = () => useContext(InstituteContext);
