import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Sparkles,
  FileEdit,
  TrendingDown,
  BookOpen,
  Phone,
  CheckCircle,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import { resultAPI } from '../services/api';

const NeedingSupport = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, FAIL, LOW_SCORE

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setLoading(true);
    try {
      const res = await resultAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setResults(res.data);
      }
    } catch (err) {
      console.warn('[Needing Support Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter for students who genuinely need academic support
  // Criteria: percentage < 60% OR resultStatus === 'FAIL' OR has any failing subject (< 33% or status === 'FAIL')
  const supportStudents = results.filter((r) => {
    const hasFailingSubject = (r.subjects || []).some((s) => s.status === 'FAIL' || (Number(s.percentage) || 0) < 33);
    const isLowScore = (Number(r.percentage) || 0) < 60;
    const isFailStatus = r.resultStatus === 'FAIL';
    return isFailStatus || isLowScore || hasFailingSubject;
  });

  // Calculate high-level performance indicators from actual records
  const criticalCount = supportStudents.filter((r) => r.resultStatus === 'FAIL').length;
  const borderlineCount = supportStudents.filter((r) => r.resultStatus !== 'FAIL' && (r.percentage || 0) < 60).length;

  // Find most frequent weak subject across these students
  const weakSubjectFrequency = {};
  supportStudents.forEach((r) => {
    (r.subjects || []).forEach((s) => {
      if (s.status === 'FAIL' || (Number(s.percentage) || 0) < 45) {
        weakSubjectFrequency[s.subjectName] = (weakSubjectFrequency[s.subjectName] || 0) + 1;
      }
    });
  });
  const mostCriticalSubject = Object.entries(weakSubjectFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mathematics';

  // Apply search and filter controls
  const filteredStudents = supportStudents.filter((r) => {
    const name = r.studentDetails?.name || r.studentName || '';
    const roll = r.studentDetails?.rollNumber || r.rollNumber || '';
    const matchesSearch = !search.trim() ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      roll.toLowerCase().includes(search.toLowerCase());

    const matchesClass = !classFilter || r.class === classFilter;

    let matchesStatus = true;
    if (statusFilter === 'FAIL') {
      matchesStatus = r.resultStatus === 'FAIL';
    } else if (statusFilter === 'LOW_SCORE') {
      matchesStatus = r.resultStatus !== 'FAIL' && (r.percentage || 0) < 60;
    }

    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* NAVIGATION & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="font-heading font-extrabold text-2xl text-slate-900 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-[#FF7F00]" />
            <span>Students Needing Academic Support</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive overview of students requiring academic intervention, remedial attention, and score improvement.
          </p>
        </div>

        <button
          onClick={() => navigate('/result-analysis')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white text-xs font-bold shadow-md shadow-[#00264D]/15 transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4 text-[#FF7F00]" />
          <span>Launch AI Remedial Analysis</span>
        </button>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Needing Support</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-slate-900">{supportStudents.length}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF7ED] text-[#FF7F00] border border-[#FED7AA]">
              Support Cohort
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Students below academic performance threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Critical Interventions (Fail)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-rose-600">{criticalCount}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Immediate Action
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Students failing pass cutoff in one or more subjects</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Borderline Students</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-amber-600">{borderlineCount}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Score &lt; 60%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Passing students at risk of falling behind</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Highest Need Subject</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-heading font-bold text-lg text-[#00264D] truncate">{mostCriticalSubject}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              Key Focus
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Most common subject requiring remedial coaching</p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#FF7F00] outline-none transition-all"
          >
            <option value="">All Classes</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#FF7F00] outline-none transition-all"
          >
            <option value="ALL">All Support Needs</option>
            <option value="FAIL">Critical Failures Only</option>
            <option value="LOW_SCORE">Borderline (&lt; 60%) Only</option>
          </select>
        </div>
      </div>

      {/* DETAILED STUDENT CARDS LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-[#FF7F00] border-t-transparent rounded-full mb-2"></div>
          <p className="text-xs font-semibold">Loading student academic records from database...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-base text-slate-900">No Students Require Support Matching These Criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search or class filter to view all student records.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((r) => {
            const student = r.studentDetails || {};
            const isCritical = r.resultStatus === 'FAIL';
            const failingSubjects = (r.subjects || []).filter((s) => s.status === 'FAIL' || (Number(s.percentage) || 0) < 33);

            return (
              <div
                key={r._id || r.resultId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs ${
                        isCritical ? 'bg-rose-600' : 'bg-[#FF7F00]'
                      }`}
                    >
                      {student.name?.charAt(0) || 'S'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-slate-900">{student.name || 'Student'}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isCritical ? 'Critical Support (FAIL)' : 'Remedial Monitoring'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Roll No: <strong className="text-slate-800">{student.rollNumber || 'N/A'}</strong> • Admission: <strong className="text-slate-800">{student.admissionNumber || 'N/A'}</strong> • {r.class} ({r.section})
                      </p>
                    </div>
                  </div>

                  {/* OVERALL SCORE & ACTIONS */}
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
                      <span className={`text-xl font-extrabold ${isCritical ? 'text-rose-600' : 'text-[#FF7F00]'}`}>
                        {r.percentage}%
                      </span>
                      <span className="text-xs font-bold text-slate-500 ml-1.5">(Grade {r.grade})</span>
                    </div>

                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                      <button
                        onClick={() => navigate('/result-analysis', { state: r })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white text-xs font-bold transition-all shadow-2xs"
                        title="Open AI Analysis for this student"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#FF7F00]" />
                        <span>AI Analysis</span>
                      </button>

                      <button
                        onClick={() => navigate(`/results/${r._id || r.resultId}`)}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#00264D] hover:bg-slate-100 transition-colors"
                        title="View Official Report Card"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/marks-entry?studentId=${r.studentId}`)}
                        className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Update Marks"
                      >
                        <FileEdit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBJECT-WISE PERFORMANCE GRID */}
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Subject-Wise Marks & Status Breakdown
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {(r.subjects || []).map((sub, sIdx) => {
                        const isSubFailed = sub.status === 'FAIL' || (Number(sub.percentage) || 0) < 33;
                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-xl border text-xs transition-colors ${
                              isSubFailed
                                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="font-bold block truncate" title={sub.subjectName}>{sub.subjectName}</span>
                            <div className="mt-1 flex items-baseline justify-between">
                              <span className="font-extrabold text-sm">
                                {sub.obtainedMarks} <span className="text-[10px] font-medium text-slate-400">/ {sub.maximumMarks}</span>
                              </span>
                              <span className={`font-bold text-xs ${isSubFailed ? 'text-rose-600' : 'text-[#00264D]'}`}>
                                {sub.percentage}%
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-500">Grade {sub.grade}</span>
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                  isSubFailed ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* IDENTIFIED WEAKNESSES & REMEDIAL AREAS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-[#FFF7ED]/50 p-3.5 rounded-xl border border-orange-200 space-y-1.5">
                      <span className="font-bold text-[#FF7F00] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>Identified Areas Requiring Improvement</span>
                      </span>
                      <ul className="space-y-1 text-slate-700 font-medium">
                        {(r.weaknesses && r.weaknesses.length > 0) ? (
                          r.weaknesses.map((w, wIdx) => (
                            <li key={wIdx} className="flex items-start gap-1.5">
                              <span className="text-[#FF7F00] font-bold">•</span>
                              <span>{w}</span>
                            </li>
                          ))
                        ) : failingSubjects.length > 0 ? (
                          failingSubjects.map((fs, fsIdx) => (
                            <li key={fsIdx} className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold">•</span>
                              <span>Failed pass threshold in {fs.subjectName} ({fs.percentage}% - Grade {fs.grade})</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-500">Overall academic average requires general revision.</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-[#00264D] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-[#00264D]" />
                        <span>Recommended Remedial Action</span>
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {(r.aiSuggestions && r.aiSuggestions[0]) || (r.teacherRemark) || 'Schedule 45 minutes daily dedicated remedial study for weak subjects and review concepts with subject teachers.'}
                      </p>
                      {student.phone && (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>Parent Contact: <strong className="text-slate-700">{student.phone}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NeedingSupport;

