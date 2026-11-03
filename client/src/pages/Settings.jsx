import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building, Award, Check } from 'lucide-react';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    schoolName: 'Delhi Public International Academy',
    schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces',
    schoolAddress: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
    schoolPhone: '+91 120 4567 890',
    schoolEmail: 'info@dpia.edu.in',
    academicSession: '2025-26',
    defaultPassMarkPercentage: 33,
    aiApiKey: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn('[Load Settings Error]', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await settingsAPI.update(settings);
      if (res.success) {
        setSuccessMsg('School parameters & grading rules updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-[#00264D]" />
          <span>School & Grading Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure school identity, grading scale rules, and pass thresholds.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Building className="h-4 w-4 text-[#00264D]" />
            <span>School Branding & Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                School Name
              </label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                School Logo Image URL
              </label>
              <input
                type="text"
                value={settings.schoolLogo}
                onChange={(e) => setSettings({ ...settings, schoolLogo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                School Address
              </label>
              <input
                type="text"
                value={settings.schoolAddress}
                onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={settings.schoolPhone}
                onChange={(e) => setSettings({ ...settings, schoolPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.schoolEmail}
                onChange={(e) => setSettings({ ...settings, schoolEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Academic & Grading Boundaries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-[#FF7F00]" />
            <span>Academic Session & Pass Mark Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                value={settings.academicSession}
                onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Pass Mark Cutoff (%)
              </label>
              <input
                type="number"
                value={settings.defaultPassMarkPercentage}
                onChange={(e) => setSettings({ ...settings, defaultPassMarkPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
