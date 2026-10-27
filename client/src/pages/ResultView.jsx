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
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Student Report Card...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
          Report Card Not Found
        </h3>
        <p className="text-xs text-slate-500">{error || 'The requested result ID does not exist.'}</p>
        <button
          onClick={() => navigate('/results')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Result History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="no-print">
        <button
          onClick={() => navigate('/results')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Result History</span>
        </button>
      </div>

      <ReportCard result={result} schoolInfo={schoolInfo} />
    </div>
  );
};

export default ResultView;
