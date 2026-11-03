import React from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { printResultCard, downloadResultPDF } from '../services/pdfService';

const ReportCard = ({ result, schoolInfo }) => {
  if (!result) return null;

  const schoolName = schoolInfo?.schoolName || 'Delhi Public International Academy';
  const schoolAddress = schoolInfo?.schoolAddress || 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308';
  const schoolPhone = schoolInfo?.schoolPhone || '+91 120 4567 890';
  const schoolEmail = schoolInfo?.schoolEmail || 'info@dpia.edu.in';
  const logoUrl = schoolInfo?.schoolLogo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces';

  const student = result.studentDetails || {};
  const isPass = result.resultStatus === 'PASS';

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Result Report Card - ${student.name}`,
          text: `Check out ${student.name}'s Academic Result (${result.percentage}% - Grade ${result.grade})`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Result URL copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Official Report Card #{result.resultId || 'RES'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Generated on {new Date(result.generatedAt || result.createdAt || Date.now()).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printResultCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Result</span>
          </button>

          <button
            onClick={() => downloadResultPDF('report-card-printable', `ReportCard_${student.name || 'Student'}.pdf`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF7F00] hover:bg-[#E06D00] text-white shadow-xs shadow-[#FF7F00]/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Share Result"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Printable Report Card Canvas */}
      <div
        id="report-card-printable"
        className="printable-area bg-white text-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-md space-y-6"
      >
        {/* HEADER (#00264D) */}
        <div className="bg-[#00264D] text-white p-6 rounded-2xl shadow-sm border-b-4 border-[#FF7F00]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={logoUrl}
                alt="School Logo"
                className="h-16 w-16 object-cover rounded-2xl border-2 border-white shadow-xs"
              />
              <div>
                <h1 className="font-heading font-extrabold text-2xl tracking-tight uppercase text-white">
                  {schoolName}
                </h1>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  {schoolAddress}
                </p>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Phone: {schoolPhone} | Email: {schoolEmail}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-md bg-[#FF7F00] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                Session {result.session || '2025-26'}
              </span>
              <p className="text-xs font-bold tracking-widest text-slate-300 mt-2 uppercase">
                ANKSETU • OFFICIAL REPORT CARD
              </p>
            </div>
          </div>
        </div>

        {/* STUDENT DETAILS GRID */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Roll Number</span>
              <span className="font-bold text-slate-900 text-sm">{student.rollNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Admission No.</span>
              <span className="font-bold text-slate-900 text-sm">{student.admissionNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Class & Section</span>
              <span className="font-bold text-slate-900 text-sm">{result.class} - {result.section}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Date of Birth</span>
              <span className="font-medium text-slate-700">{student.dateOfBirth || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Father's Name</span>
              <span className="font-medium text-slate-700">{student.fatherName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Mother's Name</span>
              <span className="font-medium text-slate-700">{student.motherName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Contact Phone</span>
              <span className="font-medium text-slate-700">{student.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* MARKS BREAKDOWN TABLE */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
            Academic Performance Summary
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3 border-b border-slate-200">Subject Name</th>
                  <th className="p-3 border-b border-slate-200 text-center">Max Marks</th>
                  <th className="p-3 border-b border-slate-200 text-center">Obtained Marks</th>
                  <th className="p-3 border-b border-slate-200 text-center">Percentage</th>
                  <th className="p-3 border-b border-slate-200 text-center">Grade</th>
                  <th className="p-3 border-b border-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(result.subjects || []).map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 font-bold text-slate-900">{sub.subjectName}</td>
                    <td className="p-3 text-center text-slate-600">{sub.maximumMarks}</td>
                    <td className="p-3 text-center font-bold text-[#00264D]">{sub.obtainedMarks}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{sub.percentage}%</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-bold bg-[#FF7F00]/15 text-[#FF7F00]">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                          sub.status === 'PASS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OVERALL SUMMARY BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 shadow-2xs">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-bold">Total Max</span>
            <span className="font-extrabold text-base text-slate-900">{result.totalMarks}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-bold">Obtained</span>
            <span className="font-extrabold text-base text-[#00264D]">{result.obtainedMarks}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-bold">Percentage</span>
            <span className="font-extrabold text-base text-[#FF7F00]">{result.percentage}%</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-bold">Overall Grade</span>
            <span className="font-extrabold text-base text-slate-900">{result.grade}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                isPass
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isPass ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-rose-600" />}
              {result.resultStatus}
            </span>
          </div>
        </div>

        {/* AI PERFORMANCE ANALYSIS */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-[#00264D] font-bold font-heading text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
            <Sparkles className="h-4 w-4 text-[#FF7F00]" />
            <span>AnkSetu AI Performance Feedback</span>
          </div>

          {result.teacherRemark && (
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                Overall Remark
              </span>
              <p className="text-slate-800 font-medium italic mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                "{result.teacherRemark}"
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider block mb-1">
                  Key Academic Strengths
                </span>
                <ul className="space-y-1 text-slate-700 font-medium">
                  {result.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-[#FF7F00] uppercase text-[10px] tracking-wider block mb-1">
                  Areas for Improvement
                </span>
                <ul className="space-y-1 text-slate-700 font-medium">
                  {result.weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#FF7F00] font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI Personalized Suggestions */}
          {result.aiSuggestions && result.aiSuggestions.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-[#00264D] uppercase text-[10px] tracking-wider block mb-1">
                Personalized Study Recommendations
              </span>
              <ul className="space-y-1 text-slate-700 font-medium">
                {result.aiSuggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#00264D] font-bold">✓</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ATTENDANCE SECTION */}
        {result.attendance && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00264D]" />
              <span className="font-bold text-slate-900 uppercase tracking-wider">Attendance Summary</span>
            </div>
            <div className="flex items-center gap-6 text-slate-700">
              <span>Working Days: <strong className="text-slate-900 font-bold">{result.attendance.totalWorkingDays || 200}</strong></span>
              <span>Days Present: <strong className="text-slate-900 font-bold">{result.attendance.daysPresent || 185}</strong></span>
              <span>Percentage: <strong className="text-[#00264D] font-bold">{result.attendance.attendancePercentage || 92.5}%</strong></span>
            </div>
          </div>
        )}

        {/* SIGNATURES AREA */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="border-t-2 border-slate-300 pt-2">
            <span className="font-bold text-slate-900 block">Class Teacher Signature</span>
            <span className="text-[10px] text-slate-500 font-medium">Verified & Approved</span>
          </div>
          <div className="border-t-2 border-slate-300 pt-2">
            <span className="font-bold text-slate-900 block">Principal Signature</span>
            <span className="text-[10px] text-slate-500 font-medium">Delhi Public Int. Academy</span>
          </div>
          <div className="border-t-2 border-slate-300 pt-2">
            <span className="font-bold text-slate-900 block">Parent / Guardian Signature</span>
            <span className="text-[10px] text-slate-500 font-medium">Acknowledgement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
