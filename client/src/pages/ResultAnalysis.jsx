import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Loader2,
  Check,
  BookOpen,
  Search,
  User,
  GraduationCap,
  FileEdit,
  Eye,
} from 'lucide-react';
import { aiAPI, resultAPI, studentAPI } from '../services/api';

const ResultAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // All database students & results
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Selected student state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Current analysis data
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  // Analysis sequence state
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [generatingResult, setGeneratingResult] = useState(false);

  // 1. Initial Load: Fetch all students and all results from the database
  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  const loadDatabaseRecords = async () => {
    setLoadingInitial(true);
    try {
      const [stuRes, resRes] = await Promise.all([
        studentAPI.getAll().catch(() => ({ success: false, data: [] })),
        resultAPI.getAll().catch(() => ({ success: false, data: [] })),
      ]);

      const stuList = (stuRes.success && Array.isArray(stuRes.data)) ? stuRes.data : [];
      const resList = (resRes.success && Array.isArray(resRes.data)) ? resRes.data : [];

      setStudents(stuList);
      setResults(resList);

      // Determine initial student to select
      let initialId = '';

      // Check if student was passed via location.state (e.g. from MarksEntry or NeedingSupport)
      if (location.state) {
        const passed = location.state;
        const matchingStu = stuList.find(
          (s) => s.studentId === passed.studentId || s._id === passed.studentId || s.rollNumber === passed.rollNumber
        );
        if (matchingStu) {
          initialId = matchingStu.studentId || matchingStu._id;
        } else if (passed.studentId) {
          initialId = passed.studentId;
        }
      }

      // If no student from state, select the first student who has a recorded result, or the first student in database
      if (!initialId && stuList.length > 0) {
        const studentWithResult = stuList.find((s) =>
          resList.some((r) => r.studentId === s.studentId || r.studentId === s._id || r.studentDetails?.rollNumber === s.rollNumber)
        );
        initialId = studentWithResult ? (studentWithResult.studentId || studentWithResult._id) : (stuList[0].studentId || stuList[0]._id);
      }

      if (initialId) {
        setSelectedStudentId(initialId);
      }
    } catch (err) {
      console.warn('[AI Analysis Load Error]', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  // 2. Whenever selectedStudentId or results change, update the current student and trigger analysis
  useEffect(() => {
    if (!selectedStudentId || students.length === 0) return;

    const student = students.find(
      (s) => s.studentId === selectedStudentId || s._id === selectedStudentId
    );

    if (student) {
      setCurrentStudent(student);

      // Find matching academic result in database
      const matchingRes = results.find(
        (r) =>
          r.studentId === student.studentId ||
          r.studentId === student._id ||
          (r.studentDetails && r.studentDetails.rollNumber === student.rollNumber)
      );

      if (matchingRes) {
        setCurrentResult(matchingRes);
        runAnalysisForStudent(student, matchingRes);
      } else if (location.state && location.state.subjects && location.state.studentId === selectedStudentId) {
        // Fallback to state if fresh unsaved analysis was passed from MarksEntry
        setCurrentResult(location.state);
        runAnalysisForStudent(student, location.state);
      } else {
        setCurrentResult(null);
        setAiData(null);
        setAnalyzing(false);
      }
    }
  }, [selectedStudentId, students, results]);

  // 3. Dynamic AI Analysis Engine based on actual student academic data
  const runAnalysisForStudent = async (student, resultData) => {
    const subjects = resultData.subjects || [];
    if (subjects.length === 0) {
      setAnalyzing(false);
      return;
    }

    setAnalyzing(true);
    setStep(1);

    const totalMax = subjects.reduce((sum, s) => sum + (Number(s.maximumMarks) || 100), 0);
    const totalObtained = subjects.reduce((sum, s) => sum + (Number(s.obtainedMarks) || 0), 0);
    const pct = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : (resultData.percentage || 0);
    const passStatus = resultData.resultStatus || (!subjects.some((s) => s.status === 'FAIL') && pct >= 33 ? 'PASS' : 'FAIL');

    await new Promise((r) => setTimeout(r, 350));
    setStep(2);

    try {
      const res = await aiAPI.analyze({
        studentName: student.name,
        percentage: pct,
        subjects,
        grade: resultData.grade || 'N/A',
        resultStatus: passStatus,
      });

      if (res.success && res.data) {
        // Merge with database result's stored strengths/weaknesses/remarks if available
        setAiData({
          ...res.data,
          overallRemark: resultData.teacherRemark || res.data.overallRemark,
          strengths: (resultData.strengths && resultData.strengths.length > 0) ? resultData.strengths : res.data.strengths,
          weaknesses: (resultData.weaknesses && resultData.weaknesses.length > 0) ? resultData.weaknesses : res.data.weaknesses,
          aiSuggestions: (resultData.aiSuggestions && resultData.aiSuggestions.length > 0) ? resultData.aiSuggestions : res.data.aiSuggestions,
        });
      }
    } catch (err) {
      console.warn('[AI Analysis API Error]', err);
      // Fallback rule evaluation
      setAiData({
        overallRemark: resultData.teacherRemark || `Academic performance overview for ${student.name}.`,
        strengths: resultData.strengths || ['Consistent class attendance and subject participation.'],
        weaknesses: resultData.weaknesses || ['Regular concept revision recommended.'],
        aiSuggestions: resultData.aiSuggestions || ['Schedule 45 minutes daily dedicated conceptual practice.'],
        source: 'Built-in Rule Evaluation Engine',
      });
    }

    await new Promise((r) => setTimeout(r, 350));
    setStep(3);
    await new Promise((r) => setTimeout(r, 200));

    setAnalyzing(false);
  };

  const handleGenerateOfficialResult = async () => {
    if (!currentStudent || !currentResult) return;

    setGeneratingResult(true);
    try {
      const payload = {
        studentId: currentStudent.studentId || currentStudent._id,
        session: currentStudent.session || '2025-26',
        class: currentStudent.class,
        section: currentStudent.section,
        subjects: currentResult.subjects,
        teacherRemark: currentResult.teacherRemark || aiData?.overallRemark,
      };

      const res = await resultAPI.create(payload);
      if (res.success && res.data) {
        navigate(`/results/${res.data._id || res.data.resultId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to save result report card');
    } finally {
      setGeneratingResult(false);
    }
  };

  // Filter students for the searchable selector dropdown
  const filteredStudentsForSelect = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q))
    );
  });

  // Calculate metrics for current result
  const subjects = currentResult?.subjects || [];
  const totalMax = subjects.reduce((sum, s) => sum + (Number(s.maximumMarks) || 100), 0);
  const totalObtained = subjects.reduce((sum, s) => sum + (Number(s.obtainedMarks) || 0), 0);
  const overallPercentage = currentResult?.percentage !== undefined
    ? Number(currentResult.percentage)
    : (totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0);
  const isPass = currentResult?.resultStatus
    ? currentResult.resultStatus === 'PASS'
    : (!subjects.some((s) => s.status === 'FAIL') && overallPercentage >= 33);
  const displayGrade = currentResult?.grade || (overallPercentage >= 90 ? 'A+' : overallPercentage >= 80 ? 'A' : overallPercentage >= 70 ? 'B+' : overallPercentage >= 60 ? 'B' : overallPercentage >= 50 ? 'C' : overallPercentage >= 33 ? 'D' : 'F');

  if (loadingInitial) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-[#00264D] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading student directory & academic records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* 1. STUDENT SELECTION CONTROL BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#FF7F00]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Student for AI Analysis
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            {students.length} Registered Students in Database
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Real-time search filter */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name or roll..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
            />
          </div>

          {/* Student selection dropdown */}
          <div className="sm:col-span-7">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
            >
              {filteredStudentsForSelect.length === 0 ? (
                <option value="">No students matching "{studentSearch}"</option>
              ) : (
                filteredStudentsForSelect.map((s) => {
                  const sId = s.studentId || s._id;
                  const hasRes = results.some(
                    (r) => r.studentId === s.studentId || r.studentId === s._id || r.studentDetails?.rollNumber === s.rollNumber
                  );
                  return (
                    <option key={sId} value={sId}>
                      {s.name} (Roll: {s.rollNumber}) — {s.class} ({s.section}) {hasRes ? '✓ Has Marks' : '• No Marks'}
                    </option>
                  );
                })
              )}
            </select>
          </div>
        </div>

        {/* Selected Student Information Banner */}
        {currentStudent && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Active Student:</span>
              <span className="font-extrabold text-[#00264D] bg-[#EBF2FA] px-2.5 py-0.5 rounded-lg">
                {currentStudent.name}
              </span>
              <span className="text-slate-500 font-medium">
                Roll: <strong className="text-slate-800">{currentStudent.rollNumber}</strong> • Class: <strong className="text-slate-800">{currentStudent.class} ({currentStudent.section})</strong>
              </span>
            </div>

            {currentResult ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                <span>Academic Record Loaded</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span>No Results Recorded Yet</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF7F00] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles className="h-4 w-4 text-[#FF7F00]" />
            <span>AnkSetu AI Engine</span>
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900">
            AI Performance Analysis: {currentStudent?.name || 'Student'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Roll No: {currentStudent?.rollNumber || 'N/A'} • {currentStudent?.class || 'Class'} ({currentStudent?.section || 'A'}) • Session {currentStudent?.session || '2025-26'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          {currentResult ? (
            <button
              onClick={() => navigate(`/results/${currentResult._id || currentResult.resultId}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Eye className="h-4 w-4 text-slate-500" />
              <span>View Report Card</span>
            </button>
          ) : (
            <button
              onClick={handleGenerateOfficialResult}
              disabled={generatingResult || analyzing || !currentResult}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all"
            >
              {generatingResult ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Generate Official Report Card →</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. CASE: NO ACADEMIC RECORD AVAILABLE FOR SELECTED STUDENT */}
      {!currentResult && !analyzing ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-[#FF7F00] flex items-center justify-center mx-auto border border-amber-200">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              No Examination Record Found for {currentStudent?.name || 'this student'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              This student is enrolled in the system, but has not had examination marks recorded or evaluated yet. Enter their marks to run full AI performance insights.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate(`/marks-entry?studentId=${currentStudent?.studentId || currentStudent?._id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 transition-all"
            >
              <FileEdit className="h-4 w-4" />
              <span>Enter Marks & Evaluate {currentStudent?.name} →</span>
            </button>
          </div>
        </div>
      ) : analyzing ? (
        /* 4. STEP LOADING ANIMATION BANNER */
        <div className="p-8 rounded-3xl bg-[#00264D] text-white shadow-md flex flex-col items-center justify-center space-y-6 text-center border border-[#001D3D]">
          <div className="h-16 w-16 rounded-2xl bg-[#FF7F00] flex items-center justify-center text-white border-2 border-white/20 animate-pulse shadow-lg shadow-[#FF7F00]/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-3 max-w-sm">
            <h3 className="font-heading font-bold text-lg text-white">
              AI Analysis Running for {currentStudent?.name}
            </h3>
            <div className="space-y-2 text-xs font-medium text-slate-300">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white font-semibold' : ''}`}>
                {step > 1 ? <Check className="h-4 w-4 text-[#FF7F00]" /> : <Loader2 className="h-4 w-4 animate-spin text-[#FF7F00]" />}
                <span>1. Analyzing {currentStudent?.name}'s subject marks...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white font-semibold' : ''}`}>
                {step > 2 ? <Check className="h-4 w-4 text-[#FF7F00]" /> : step === 2 ? <Loader2 className="h-4 w-4 animate-spin text-[#FF7F00]" /> : null}
                <span>2. Identifying strengths & areas needing improvement...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-white font-semibold' : ''}`}>
                {step === 3 ? <Loader2 className="h-4 w-4 animate-spin text-[#FF7F00]" /> : null}
                <span>3. Generating tailored study recommendations...</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 5. OVERALL PERFORMANCE SUMMARY BANNER */}
          <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-4 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Maximum</span>
              <span className="text-xl font-extrabold text-slate-900">{totalMax}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Marks Obtained</span>
              <span className="text-xl font-extrabold text-[#00264D]">{totalObtained}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Percentage</span>
              <span className={`text-xl font-extrabold ${isPass ? 'text-[#FF7F00]' : 'text-rose-600'}`}>
                {overallPercentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Result Grade</span>
              <span className="text-xl font-extrabold text-slate-900">
                Grade {displayGrade}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPass
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* 6. SUBJECT SCORE BREAKDOWN SUMMARY TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Subject Marks & Performance Breakdown ({subjects.length} Subjects)
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Student: {currentStudent?.name}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5 text-center">Max Marks</th>
                    <th className="p-3.5 text-center">Obtained</th>
                    <th className="p-3.5 text-center">Score %</th>
                    <th className="p-3.5 text-center">Grade</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s, idx) => {
                    const isSubFailed = s.status === 'FAIL' || (Number(s.percentage) || 0) < 33;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{s.subjectName}</td>
                        <td className="p-3.5 text-center text-slate-600">{s.maximumMarks}</td>
                        <td className="p-3.5 text-center font-bold text-[#00264D]">{s.obtainedMarks}</td>
                        <td className="p-3.5 text-center font-bold text-slate-900">
                          <div className="inline-flex items-center gap-2">
                            <span className="w-12 text-right">{s.percentage}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                              <div
                                className={`h-1.5 rounded-full ${isSubFailed ? 'bg-rose-500' : 'bg-[#00264D]'}`}
                                style={{ width: `${Math.min(100, s.percentage)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-[#FF7F00]">{s.grade}</td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              !isSubFailed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. DYNAMIC AI PERFORMANCE ANALYSIS CONTAINER */}
          <div className="bg-[#00264D] text-white p-6 sm:p-8 rounded-3xl border border-[#001D3D] shadow-md space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#FF7F00] text-white shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-1.5">
                  AI Performance Analysis: {currentStudent?.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Modular Intelligence • Source: {aiData?.source || 'Rule Evaluation Engine'}
                </p>
              </div>
            </div>

            {/* Overall Remark Card */}
            <div className="bg-white text-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Overall Remark
              </span>
              <p className="text-xs sm:text-sm font-semibold italic leading-relaxed text-slate-900">
                "{aiData?.overallRemark || `Academic evaluation for ${currentStudent?.name}.`}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths Card */}
              <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-xs border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Strengths</span>
                </span>
                <ul className="space-y-2 text-xs font-medium text-slate-700">
                  {(aiData?.strengths && aiData.strengths.length > 0) ? (
                    aiData.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">Subject foundational effort demonstrated.</li>
                  )}
                </ul>
              </div>

              {/* Areas for Improvement Card */}
              <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-xs border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-[#FF7F00]" />
                  <span>Areas for Improvement</span>
                </span>
                <ul className="space-y-2 text-xs font-medium text-slate-700">
                  {(aiData?.weaknesses && aiData.weaknesses.length > 0) ? (
                    aiData.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#FF7F00] font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">No critical weaknesses detected. Keep up the high standard.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Personalized Suggestions Card */}
            <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-xs border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-[#00264D] uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-[#FF7F00]" />
                <span>Personalized Suggestions for {currentStudent?.name}</span>
              </span>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                {(aiData?.aiSuggestions && aiData.aiSuggestions.length > 0) ? (
                  aiData.aiSuggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#00264D] font-bold">✓</span>
                      <span>{sug}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Continue consistent revision schedule and mock test solving.</li>
                )}
              </ul>
            </div>

            {/* Recommended Study Plan Card */}
            <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-xs border-l-4 border-[#FF7F00] space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#FF7F00]" />
                <span>Recommended Study Plan</span>
              </span>
              <p className="text-xs font-medium leading-relaxed text-slate-700">
                {isPass
                  ? `Maintain 45 minutes daily dedicated conceptual practice for ${currentStudent?.name}, solve previous year mock papers, and conduct weekly self-assessment tests.`
                  : `Immediate remedial intervention: 60 minutes daily targeted practice for ${currentStudent?.name} in challenging subjects, formula revision with subject teachers, and bi-weekly diagnostic tests.`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultAnalysis;
