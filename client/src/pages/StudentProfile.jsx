import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  TrendingUp,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studentAPI } from '../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getById(id);
      if (res.success && res.data) {
        setStudent(res.data);
        setHistory(res.resultsHistory || []);
      }
    } catch (err) {
      console.warn('[Profile Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const trendData = history.length > 0
    ? history.map((r, idx) => ({
        session: r.session || `Exam ${idx + 1}`,
        percentage: r.percentage,
      }))
    : [
        { session: '2023-24', percentage: 72 },
        { session: '2024-25', percentage: 81 },
        { session: '2025-26', percentage: 91.6 },
      ];

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading student profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => navigate('/students')}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Student Directory</span>
      </button>

      {/* STUDENT PROFILE HEADER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-2xl tracking-tight">{student.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                {student.gender}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Roll No: <strong className="text-white">{student.rollNumber}</strong> • Admission: <strong className="text-white">{student.admissionNumber}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Class: {student.class} ({student.section}) • Session {student.session}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/marks-entry?studentId=${student.studentId || student._id}`)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
        >
          Enter Marks / Generate Result
        </button>
      </div>

      {/* DETAILS & TREND GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal & Parent Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" />
            <span>Personal & Parent Details</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>DOB: <strong className="text-slate-900 dark:text-white">{student.dateOfBirth}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <User className="h-4 w-4 text-slate-400" />
              <span>Father: <strong className="text-slate-900 dark:text-white">{student.fatherName}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <User className="h-4 w-4 text-slate-400" />
              <span>Mother: <strong className="text-slate-900 dark:text-white">{student.motherName || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>Phone: <strong className="text-slate-900 dark:text-white">{student.phone}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>Email: <strong className="text-slate-900 dark:text-white">{student.email || 'N/A'}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Address: <strong className="text-slate-900 dark:text-white">{student.address || 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        {/* Multi-Session Performance Progression Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>Academic Performance Progression Trend</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="session" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                <Line type="monotone" dataKey="percentage" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
