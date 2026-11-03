import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import ReportCard from '../components/ReportCard';
import { resultAPI, settingsAPI } from '../services/api';

const ResultView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResultAndSettings();
  }, [id]);

  const loadResultAndSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, settData] = await Promise.all([
        resultAPI.getById(id),
        settingsAPI.get().catch(() => ({ success: false })),
      ]);

      if (resData.success && resData.data) {
        setResult(resData.data);
      } else {
        setError('Result card record not found.');
      }

      if (settData.success && settData.data) {
        setSchoolInfo(settData.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-[#00264D] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Student Report Card...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="font-heading font-bold text-lg text-slate-900">
          Report Card Not Found
        </h3>
        <p className="text-xs text-slate-500">{error || 'The requested result record does not exist.'}</p>
        <button
          onClick={() => navigate('/results')}
          className="px-4 py-2 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white text-xs font-bold transition-all shadow-xs"
        >
          Back to Results
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="no-print">
        <button
          onClick={() => navigate('/results')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Results</span>
        </button>
      </div>

      <ReportCard result={result} schoolInfo={schoolInfo} />
    </div>
  );
};

export default ResultView;
