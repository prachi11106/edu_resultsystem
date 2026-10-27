import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileEdit,
  Plus,
  Trash2,
  Sparkles,
  Calculator,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
} from 'lucide-react';
import { studentAPI, subjectAPI, resultAPI } from '../services/api';
import { getGradeFromPercentage } from '../utils/grading';

const defaultSubjectList = [
  { subjectName: 'English Core', maximumMarks: 100, obtainedMarks: 85 },
  { subjectName: 'Mathematics', maximumMarks: 100, obtainedMarks: 92 },
  { subjectName: 'Science & Technology', maximumMarks: 100, obtainedMarks: 78 },
  { subjectName: 'Social Studies', maximumMarks: 100, obtainedMarks: 88 },
  { subjectName: 'Computer Applications', maximumMarks: 100, obtainedMarks: 95 },
];

const MarksEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [session, setSession] = useState('2025-26');
  const [className, setClassName] = useState('Class 10');
  const [section, setSection] = useState('A');
  const [teacherRemark, setTeacherRemark] = useState('');

  const [subjects, setSubjects] = useState(defaultSubjectList);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await studentAPI.getAll();
      if (res.success && res.data.length > 0) {
        setStudents(res.data);
        if (!selectedStudentId) {
          setSelectedStudentId(res.data[0].studentId || res.data[0]._id);
        }
      }
    } catch (err) {
      console.warn('[Load Students Error]', err);
    }
  };

  const handleStudentSelect = (id) => {
    setSelectedStudentId(id);
    const s = students.find((st) => st.studentId === id || st._id === id);
    if (s) {
      setClassName(s.class || 'Class 10');
      setSection(s.section || 'A');
      setSession(s.session || '2025-26');
    }
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    if (field === 'maximumMarks' || field === 'obtainedMarks') {
      updated[index][field] = value === '' ? '' : Math.max(0, Number(value));
    } else {
      updated[index][field] = value;
    }
    setSubjects(updated);
  };

  const addSubjectRow = () => {
    setSubjects([...subjects, { subjectName: 'New Subject', maximumMarks: 100, obtainedMarks: 0 }]);
  };

  const removeSubjectRow = (index) => {
    if (subjects.length <= 1) {
      alert('At least one subject is required.');
      return;
    }
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  // Real-time calculation helpers
  let totalMax = 0;
  let totalObtained = 0;
  let hasFailedSubject = false;

  const processedSubjects = subjects.map((sub) => {
    const maxM = Number(sub.maximumMarks) || 100;
    const obtM = Number(sub.obtainedMarks) || 0;
    const pct = maxM > 0 ? Number(((obtM / maxM) * 100).toFixed(1)) : 0;
    const grade = getGradeFromPercentage(pct);
    const isPass = pct >= 33;

    if (!isPass) hasFailedSubject = true;
    totalMax += maxM;
    totalObtained += obtM;

    return {
      ...sub,
      percentage: pct,
      grade,
      status: isPass ? 'PASS' : 'FAIL',
    };
  });

  const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
  const overallGrade = getGradeFromPercentage(overallPercentage);
  const resultStatus = (!hasFailedSubject && overallPercentage >= 33) ? 'PASS' : 'FAIL';

  const validateInputs = () => {
    for (const sub of subjects) {
      const maxM = Number(sub.maximumMarks);
      const obtM = Number(sub.obtainedMarks);
      if (!sub.subjectName.trim()) {
        return 'All subject rows must have a subject name.';
      }
      if (isNaN(obtM) || obtM < 0) {
        return `Obtained marks for '${sub.subjectName}' cannot be negative.`;
      }
      if (obtM > maxM) {
        return `Obtained marks (${obtM}) for '${sub.subjectName}' cannot exceed maximum marks (${maxM}).`;
      }
    }
    return null;
  };

  const handleProceedToAnalysis = () => {
    setErrorMsg('');
    const valErr = validateInputs();
    if (valErr) {
      setErrorMsg(valErr);
      return;
    }

    const currentStudent = students.find((s) => s.studentId === selectedStudentId || s._id === selectedStudentId);

    navigate('/result-analysis', {
      state: {
        studentId: selectedStudentId,
        studentName: currentStudent?.name || 'Selected Student',
        rollNumber: currentStudent?.rollNumber || '1001',
        class: className,
        section,
        session,
        subjects: processedSubjects,
        teacherRemark,
      },
    });
  };

  const handleDirectSave = async () => {
    setErrorMsg('');
    const valErr = validateInputs();
    if (valErr) {
      setErrorMsg(valErr);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        studentId: selectedStudentId,
        class: className,
        section,
        session,
        subjects: processedSubjects,
        teacherRemark,
      };

      const res = await resultAPI.create(payload);
      if (res.success && res.data) {
        navigate(`/results/${res.data._id || res.data.resultId}`);
      } else {
        setErrorMsg(res.message || 'Failed to save result card.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-indigo-600" />
            <span>Marks & Subject Entry System</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter marks, dynamically configure subjects, and review real-time score calculations.
          </p>
        </div>

        <button
          onClick={handleProceedToAnalysis}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Analyze & Generate Result →</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STUDENT SELECTION CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-500" />
          <span>Student & Academic Session</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {students.map((st) => (
                <option key={st._id || st.studentId} value={st.studentId || st._id}>
                  {st.name} (Roll: {st.rollNumber} - {st.class})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Class
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Section
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* DYNAMIC MARKS ENTRY TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-4 w-4 text-indigo-500" />
            <span>Subject Marks Entry</span>
          </h3>

          <button
            onClick={addSubjectRow}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Subject Name</th>
                <th className="p-4 text-center">Max Marks</th>
                <th className="p-4 text-center">Obtained Marks</th>
                <th className="p-4 text-center">Percentage</th>
                <th className="p-4 text-center">Grade</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processedSubjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3">
                    <input
                      type="text"
                      value={sub.subjectName}
                      onChange={(e) => handleSubjectChange(idx, 'subjectName', e.target.value)}
                      placeholder="Subject Name"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={sub.maximumMarks}
                      onChange={(e) => handleSubjectChange(idx, 'maximumMarks', e.target.value)}
                      className="w-20 px-2 py-1.5 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={sub.obtainedMarks}
                      onChange={(e) => handleSubjectChange(idx, 'obtainedMarks', e.target.value)}
                      className="w-24 px-2 py-1.5 text-center rounded-lg bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 font-bold text-indigo-900 dark:text-indigo-300"
                    />
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {sub.percentage}%
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        sub.status === 'PASS'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeSubjectRow(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REAL-TIME SUMMARY & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Remarks Input */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Teacher's Manual Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={teacherRemark}
            onChange={(e) => setTeacherRemark(e.target.value)}
            placeholder="Add custom observations or leave blank for AI auto-generation..."
            className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        {/* Instant Calculation Preview Box */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Real-time Total Calculation
            </span>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Total Max Marks:</span>
                <span className="block font-bold text-base text-white">{totalMax}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Obtained:</span>
                <span className="block font-bold text-base text-amber-400">{totalObtained}</span>
              </div>
              <div>
                <span className="text-slate-400">Percentage:</span>
                <span className="block font-extrabold text-lg text-emerald-400">{overallPercentage}%</span>
              </div>
              <div>
                <span className="text-slate-400">Grade & Status:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-indigo-300">{overallGrade}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      resultStatus === 'PASS' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {resultStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleProceedToAnalysis}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Proceed to AI Analysis</span>
            </button>
            <button
              onClick={handleDirectSave}
              disabled={saving}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              {saving ? 'Generating Report...' : 'Save & Print Result Card'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksEntry;
