import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BarChart3,
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Loader2,
  Check,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { aiAPI, resultAPI } from '../services/api';

const ResultAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const inputState = location.state || {
    studentId: 'STU-1001',
    studentName: 'Aarav Patel',
    rollNumber: '1001',
    class: 'Class 10',
    section: 'A',
    session: '2025-26',
    subjects: [
      { subjectName: 'English Core', maximumMarks: 100, obtainedMarks: 88, percentage: 88, grade: 'A', status: 'PASS' },
      { subjectName: 'Mathematics', maximumMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+', status: 'PASS' },
      { subjectName: 'Science & Tech', maximumMarks: 100, obtainedMarks: 76, percentage: 76, grade: 'B+', status: 'PASS' },
      { subjectName: 'Social Studies', maximumMarks: 100, obtainedMarks: 84, percentage: 84, grade: 'A', status: 'PASS' },
      { subjectName: 'Computer', maximumMarks: 100, obtainedMarks: 98, percentage: 98, grade: 'A+', status: 'PASS' },
    ],
  };

  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(true);
  const [aiData, setAiData] = useState(null);
  const [generatingResult, setGeneratingResult] = useState(false);

  const totalMax = inputState.subjects.reduce((sum, s) => sum + (Number(s.maximumMarks) || 100), 0);
  const totalObtained = inputState.subjects.reduce((sum, s) => sum + (Number(s.obtainedMarks) || 0), 0);
  const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
  const isPass = !inputState.subjects.some((s) => s.status === 'FAIL') && overallPercentage >= 33;

  useEffect(() => {
    runAnalysisSequence();
  }, []);

  const runAnalysisSequence = async () => {
    setAnalyzing(true);
    setStep(1);

    await new Promise((r) => setTimeout(r, 500));
    setStep(2);

    try {
      const res = await aiAPI.analyze({
        studentName: inputState.studentName,
        percentage: overallPercentage,
        subjects: inputState.subjects,
        resultStatus: isPass ? 'PASS' : 'FAIL',
      });
      if (res.success) {
        setAiData(res.data);
      }
    } catch (err) {
      console.warn('[AI Analysis Error]', err);
    }

    await new Promise((r) => setTimeout(r, 500));
    setStep(3);
    await new Promise((r) => setTimeout(r, 400));

    setAnalyzing(false);
  };

  const handleGenerateOfficialResult = async () => {
    setGeneratingResult(true);
    try {
      const payload = {
        studentId: inputState.studentId,
        session: inputState.session,
        class: inputState.class,
        section: inputState.section,
        subjects: inputState.subjects,
        teacherRemark: inputState.teacherRemark || aiData?.overallRemark,
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

  const radarData = inputState.subjects.map((s) => ({
    subject: s.subjectName.split(' ')[0],
    score: s.percentage,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#332F35] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles className="h-4 w-4 text-[#332F35]" />
            <span>AnkSetu AI Engine</span>
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#332F35]">
            AI Performance Analysis: {inputState.studentName}
          </h1>
          <p className="text-xs text-[#625B64] mt-0.5 font-medium">
            Roll No: {inputState.rollNumber} • {inputState.class} ({inputState.section})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFE2E2] text-[#332F35] hover:bg-[#F5CBCB] text-xs font-extrabold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Edit Marks</span>
          </button>
          <button
            onClick={handleGenerateOfficialResult}
            disabled={generatingResult || analyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5CBCB] hover:bg-[#C5B3D3] text-[#332F35] font-extrabold text-xs shadow-xs disabled:opacity-50 transition-all"
          >
            {generatingResult ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>Generate Official Report Card →</span>
          </button>
        </div>
      </div>

      {/* STEP LOADING ANIMATION BANNER */}
      {analyzing ? (
        <div className="p-8 rounded-3xl bg-[#C5B3D3] text-[#332F35] shadow-sm flex flex-col items-center justify-center space-y-6 text-center border border-white">
          <div className="h-16 w-16 rounded-2xl bg-[#F5CBCB] flex items-center justify-center text-[#332F35] border border-white animate-pulse">
            <Sparkles className="h-8 w-8 text-[#332F35]" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="font-heading font-extrabold text-lg text-[#332F35]">
              ✨ AI Performance Analysis Running
            </h3>
            <div className="space-y-2 text-xs font-bold text-[#332F35]">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#332F35]' : ''}`}>
                {step > 1 ? <Check className="h-4 w-4 text-[#332F35]" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                <span>1. Analyzing student subject marks...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#332F35]' : ''}`}>
                {step > 2 ? <Check className="h-4 w-4 text-[#332F35]" /> : step === 2 ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>2. Generating personalized recommendations...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#332F35]' : ''}`}>
                {step === 3 ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>3. Preparing report card metrics...</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* OVERALL PERFORMANCE SUMMARY BANNER (#FFE2E2 background) */}
          <div className="p-6 rounded-2xl bg-[#FFE2E2] text-[#332F35] shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-4 border border-[#F5CBCB]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#625B64] block">Total Max</span>
              <span className="text-xl font-extrabold text-[#332F35]">{totalMax}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#625B64] block">Obtained</span>
              <span className="text-xl font-extrabold text-[#332F35]">{totalObtained}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#625B64] block">Overall Score</span>
              <span className="text-xl font-extrabold text-[#332F35] bg-[#F5CBCB] px-2 py-0.5 rounded-lg inline-block">{overallPercentage}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#625B64] block">Result Grade</span>
              <span className="text-xl font-extrabold text-[#332F35]">Grade A</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
              <span
                className={`px-3.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider ${
                  isPass ? 'bg-[#F5CBCB] text-[#332F35]' : 'bg-[#FFE2E2] text-[#332F35] border border-[#F5CBCB]'
                }`}
              >
                {isPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* VISUAL CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Score Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-[#F5CBCB] shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-base text-[#332F35] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#332F35]" />
                <span>Subject Percentage Breakdown</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inputState.subjects}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFE2E2" />
                    <XAxis dataKey="subjectName" tick={{ fill: '#332F35', fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#625B64', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', color: '#332F35' }} />
                    <Bar dataKey="percentage" fill="#F5CBCB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Radar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-[#F5CBCB] shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-base text-[#332F35] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#332F35]" />
                <span>Competency Radar Chart</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#FFE2E2" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#332F35', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Student Score" dataKey="score" stroke="#332F35" fill="#C5B3D3" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI PERFORMANCE ANALYSIS MANDATORY SECTION SPECIFICATIONS:
             Background: #C5B3D3 (Soft Lavender)
             Inner cards: #FFFFFF
             Accent: #F5CBCB
             Header: ✨ AI Performance Analysis
             Display:
             - Overall Remark
             - Strengths
             - Areas for Improvement
             - Personalized Suggestions
             - Recommended Study Plan
          */}
          <div className="bg-[#C5B3D3] text-[#332F35] p-6 sm:p-8 rounded-3xl border border-white shadow-md space-y-6">
            <div className="flex items-center gap-3 border-b border-[#332F35]/15 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#F5CBCB] text-[#332F35] shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#332F35] flex items-center gap-1.5">
                  ✨ AI Performance Analysis
                </h3>
                <p className="text-xs text-[#332F35]/70 font-bold">
                  Modular Intelligence • Source: {aiData?.source || 'Rule Evaluation Engine'}
                </p>
              </div>
            </div>

            {/* Overall Remark Card (#FFFFFF) */}
            <div className="bg-white text-[#332F35] p-5 rounded-2xl shadow-xs border border-[#F5CBCB]">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#625B64] block mb-1">
                Overall Remark
              </span>
              <p className="text-xs sm:text-sm font-extrabold italic leading-relaxed text-[#332F35]">
                "{aiData?.overallRemark || 'Strong academic performance across core subjects with consistent problem-solving skills.'}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths Card (#FFFFFF inner card with #F5CBCB accent) */}
              <div className="p-5 rounded-2xl bg-white text-[#332F35] shadow-xs border border-[#F5CBCB] space-y-2">
                <span className="text-xs font-extrabold text-[#332F35] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[#332F35]" />
                  <span>Strengths</span>
                </span>
                <ul className="space-y-2 text-xs font-bold text-[#332F35]">
                  {(aiData?.strengths || []).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#332F35] font-extrabold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement Card (#FFFFFF inner card) */}
              <div className="p-5 rounded-2xl bg-white text-[#332F35] shadow-xs border border-[#F5CBCB] space-y-2">
                <span className="text-xs font-extrabold text-[#332F35] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-[#332F35]" />
                  <span>Areas for Improvement</span>
                </span>
                <ul className="space-y-2 text-xs font-bold text-[#332F35]">
                  {(aiData?.weaknesses || []).map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#332F35] font-extrabold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Personalized Suggestions Card (#FFFFFF) */}
            <div className="p-5 rounded-2xl bg-white text-[#332F35] shadow-xs border border-[#F5CBCB] space-y-2">
              <span className="text-xs font-extrabold text-[#332F35] uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-[#332F35]" />
                <span>Personalized Suggestions</span>
              </span>
              <ul className="space-y-2 text-xs font-bold text-[#332F35]">
                {(aiData?.aiSuggestions || []).map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#332F35] font-extrabold">✓</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Study Plan Card (#FFFFFF inner card with #F5CBCB accent border) */}
            <div className="p-5 rounded-2xl bg-white text-[#332F35] shadow-xs border-l-4 border-[#F5CBCB] space-y-2">
              <span className="text-xs font-extrabold text-[#332F35] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Recommended Study Plan</span>
              </span>
              <p className="text-xs font-semibold leading-relaxed text-[#332F35]">
                Schedule 45 minutes daily dedicated conceptual practice for key topics, solve previous year mock papers, and conduct weekly self-assessment tests.
              </p>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default ResultAnalysis;
