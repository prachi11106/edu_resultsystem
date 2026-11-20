import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building, Award, Check, Sun, Moon } from 'lucide-react';
import { useInstitute } from '../context/InstituteContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { instituteName, settings: contextSettings, updateAllSettings } = useInstitute();
  const { theme, toggleTheme, isDark } = useTheme();

  const [settings, setSettings] = useState({
    schoolName: instituteName || 'Delhi Public International Academy',
    schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces',
    schoolAddress: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
    schoolPhone: '+91 120 4567 890',
    schoolEmail: 'info@dpia.edu.in',
    academicSession: '2025-26',
    defaultPassMarkPercentage: 33,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync settings when context loads
  useEffect(() => {
    if (contextSettings) {
      setSettings((prev) => ({
        ...prev,
        ...contextSettings,
        schoolName: instituteName || contextSettings.schoolName || prev.schoolName,
      }));
    }
  }, [contextSettings, instituteName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await updateAllSettings(settings);
      if (res && res.success) {
        setSuccessMsg('Institute name and settings saved successfully! Changes are synchronized globally across the application.');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res?.message || 'Failed to update settings');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-[#00264D] dark:text-[#FF7F00]" />
          <span>Institutional & System Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure institute identity, session parameters, and user appearance preferences.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-xs">
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School / Institute Identity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="h-4 w-4 text-[#00264D] dark:text-[#FF7F00]" />
              <span>Institute Identity & Branding</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              Global Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Institute / School Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
                placeholder="e.g. Delhi Public International Academy"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Updating this name will instantly synchronize it across the Dashboard, Top Navbar, Report Cards, and throughout the entire application.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                School Logo Image URL
              </label>
              <input
                type="text"
                value={settings.schoolLogo}
                onChange={(e) => setSettings({ ...settings, schoolLogo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={settings.schoolPhone}
                onChange={(e) => setSettings({ ...settings, schoolPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Address
              </label>
              <input
                type="text"
                value={settings.schoolAddress}
                onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={settings.schoolEmail}
                onChange={(e) => setSettings({ ...settings, schoolEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                value={settings.academicSession}
                onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Academic & Grading Thresholds */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-[#FF7F00]" />
            <span>Academic Performance Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Pass Mark Cutoff (%)
              </label>
              <input
                type="number"
                value={settings.defaultPassMarkPercentage}
                onChange={(e) => setSettings({ ...settings, defaultPassMarkPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Appearance & Theme Preferences */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              {isDark ? <Moon className="h-4 w-4 text-[#FF7F00]" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span>Theme & Visual Appearance</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
              Current: {theme} Mode
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => { if (isDark) toggleTheme(); }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                !isDark
                  ? 'border-[#00264D] bg-[#00264D]/5 text-[#00264D] ring-2 ring-[#00264D]/10'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => { if (!isDark) toggleTheme(); }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                isDark
                  ? 'border-[#FF7F00] bg-[#FF7F00]/10 text-[#FF7F00] ring-2 ring-[#FF7F00]/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="h-4 w-4 text-amber-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
