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
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#F5CBCB] shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-[#332F35]">
            Official Report Card #{result.resultId || 'RES'}
          </h2>
          <p className="text-xs text-[#625B64] font-medium">
            Generated on {new Date(result.generatedAt || result.createdAt || Date.now()).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printResultCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#FFE2E2] text-[#332F35] hover:bg-[#F5CBCB] transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Result</span>
          </button>

          <button
            onClick={() => downloadResultPDF('report-card-printable', `ReportCard_${student.name || 'Student'}.pdf`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#F5CBCB] hover:bg-[#C5B3D3] text-[#332F35] shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-[#332F35] hover:bg-[#FBEFEF] transition-colors"
            title="Share Result"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Printable Report Card Canvas */}
      <div
        id="report-card-printable"
        className="printable-area bg-white text-[#332F35] p-8 sm:p-10 rounded-2xl border border-[#F5CBCB] shadow-lg space-y-6"
      >
        {/* HEADER (#C5B3D3) */}
        <div className="bg-[#C5B3D3] text-[#332F35] p-6 rounded-2xl shadow-xs border-b-4 border-[#F5CBCB]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={logoUrl}
                alt="School Logo"
                className="h-16 w-16 object-cover rounded-2xl border-2 border-white"
              />
              <div>
                <h1 className="font-heading font-extrabold text-2xl tracking-tight uppercase text-[#332F35]">
                  {schoolName}
                </h1>
                <p className="text-xs font-bold text-[#332F35]/90 leading-relaxed">
                  {schoolAddress}
                </p>
                <p className="text-[11px] text-[#332F35]/80 font-mono mt-0.5">
                  Phone: {schoolPhone} | Email: {schoolEmail}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-md bg-[#F5CBCB] text-[#332F35] text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                Session {result.session || '2025-26'}
              </span>
              <p className="text-xs font-extrabold tracking-widest text-[#332F35] mt-2 uppercase">
                ANKSETU • STUDENT REPORT CARD
              </p>
            </div>
          </div>
        </div>

        {/* STUDENT DETAILS GRID (#FBEFEF background) */}
        <div className="bg-[#FBEFEF] p-4 rounded-xl border border-[#F5CBCB] text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Student Name</span>
              <span className="font-extrabold text-[#332F35] text-sm">{student.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Roll Number</span>
              <span className="font-extrabold text-[#332F35] text-sm">{student.rollNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Admission No.</span>
              <span className="font-extrabold text-[#332F35] text-sm">{student.admissionNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Class & Section</span>
              <span className="font-extrabold text-[#332F35] text-sm">{result.class} - {result.section}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Date of Birth</span>
              <span className="font-bold text-[#332F35]">{student.dateOfBirth || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Father's Name</span>
              <span className="font-bold text-[#332F35]">{student.fatherName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Mother's Name</span>
              <span className="font-bold text-[#332F35]">{student.motherName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#625B64] font-bold uppercase tracking-wider block text-[10px]">Contact Phone</span>
              <span className="font-bold text-[#332F35]">{student.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* MARKS BREAKDOWN TABLE */}
        <div className="space-y-2">
          <h3 className="font-heading font-extrabold text-sm text-[#332F35] uppercase tracking-wider">
            Academic Performance Summary
          </h3>

          <div className="overflow-hidden rounded-xl border border-[#F5CBCB]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FFE2E2] text-[#332F35] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-3 border-b border-[#F5CBCB]">Subject Name</th>
                  <th className="p-3 border-b border-[#F5CBCB] text-center">Max Marks</th>
                  <th className="p-3 border-b border-[#F5CBCB] text-center">Obtained Marks</th>
                  <th className="p-3 border-b border-[#F5CBCB] text-center">Percentage</th>
                  <th className="p-3 border-b border-[#F5CBCB] text-center">Grade</th>
                  <th className="p-3 border-b border-[#F5CBCB] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFE2E2]">
                {(result.subjects || []).map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FBEFEF]'}>
                    <td className="p-3 font-extrabold text-[#332F35]">{sub.subjectName}</td>
                    <td className="p-3 text-center font-bold text-[#332F35]">{sub.maximumMarks}</td>
                    <td className="p-3 text-center font-extrabold text-[#332F35]">{sub.obtainedMarks}</td>
                    <td className="p-3 text-center font-extrabold text-[#332F35]">{sub.percentage}%</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-extrabold bg-[#C5B3D3] text-[#332F35]">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                          sub.status === 'PASS' ? 'bg-[#F5CBCB] text-[#332F35]' : 'bg-[#FFE2E2] text-[#332F35] border border-[#F5CBCB]'
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#FFE2E2] text-[#332F35] border border-[#F5CBCB] shadow-2xs">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#625B64] block font-bold">Total Max</span>
            <span className="font-extrabold text-base text-[#332F35]">{result.totalMarks}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#625B64] block font-bold">Obtained</span>
            <span className="font-extrabold text-base text-[#332F35]">{result.obtainedMarks}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#625B64] block font-bold">Percentage</span>
            <span className="font-extrabold text-base bg-[#F5CBCB] px-2 py-0.5 rounded text-[#332F35]">{result.percentage}%</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#625B64] block font-bold">Overall Grade</span>
            <span className="font-extrabold text-base text-[#332F35]">{result.grade}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                isPass ? 'bg-[#F5CBCB] text-[#332F35]' : 'bg-white text-[#332F35] border border-[#F5CBCB]'
              }`}
            >
              {isPass ? <CheckCircle className="h-3.5 w-3.5 text-[#332F35]" /> : <XCircle className="h-3.5 w-3.5 text-[#332F35]" />}
              {result.resultStatus}
            </span>
          </div>
        </div>

        {/* AI PERFORMANCE ANALYSIS (#FFE2E2 headers, #F5CBCB accent) */}
        <div className="border border-[#F5CBCB] rounded-xl p-4 bg-[#FBEFEF] space-y-4 text-xs">
          <div className="flex items-center gap-2 text-[#332F35] font-extrabold font-heading text-sm uppercase tracking-wider border-b border-[#F5CBCB] pb-2">
            <Sparkles className="h-4 w-4 text-[#332F35]" />
            <span>AnkSetu AI Performance Feedback</span>
          </div>

          {result.teacherRemark && (
            <div>
              <span className="font-bold text-[#625B64] uppercase text-[10px] tracking-wider block">
                Overall Remark
              </span>
              <p className="text-[#332F35] font-bold italic mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-[#F5CBCB]">
                "{result.teacherRemark}"
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-[#F5CBCB]">
                <span className="font-extrabold text-[#332F35] uppercase text-[10px] tracking-wider block mb-1">
                  Key Academic Strengths
                </span>
                <ul className="space-y-1 text-[#332F35] font-semibold">
                  {result.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#332F35] font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-[#F5CBCB]">
                <span className="font-extrabold text-[#332F35] uppercase text-[10px] tracking-wider block mb-1">
                  Areas for Improvement
                </span>
                <ul className="space-y-1 text-[#332F35] font-semibold">
                  {result.weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#332F35] font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI Personalized Suggestions */}
          {result.aiSuggestions && result.aiSuggestions.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-[#F5CBCB]">
              <span className="font-extrabold text-[#332F35] uppercase text-[10px] tracking-wider block mb-1">
                Personalized Study Recommendations
              </span>
              <ul className="space-y-1 text-[#332F35] font-semibold">
                {result.aiSuggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#332F35] font-bold">✓</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ATTENDANCE SECTION */}
        {result.attendance && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-[#F5CBCB] bg-[#FFE2E2] text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#332F35]" />
              <span className="font-extrabold text-[#332F35] uppercase tracking-wider">Attendance Summary</span>
            </div>
            <div className="flex items-center gap-6 text-[#332F35]">
              <span>Working Days: <strong className="text-[#332F35] font-bold">{result.attendance.totalWorkingDays || 200}</strong></span>
              <span>Days Present: <strong className="text-[#332F35] font-bold">{result.attendance.daysPresent || 185}</strong></span>
              <span>Percentage: <strong className="text-[#332F35] font-extrabold">{result.attendance.attendancePercentage || 92.5}%</strong></span>
            </div>
          </div>
        )}

        {/* SIGNATURES AREA */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="border-t-2 border-[#F5CBCB] pt-2">
            <span className="font-extrabold text-[#332F35] block">Class Teacher Signature</span>
            <span className="text-[10px] text-[#625B64] font-semibold">Verified & Approved</span>
          </div>
          <div className="border-t-2 border-[#F5CBCB] pt-2">
            <span className="font-extrabold text-[#332F35] block">Principal Signature</span>
            <span className="text-[10px] text-[#625B64] font-semibold">Delhi Public Int. Academy</span>
          </div>
          <div className="border-t-2 border-[#F5CBCB] pt-2">
            <span className="font-extrabold text-[#332F35] block">Parent / Guardian Signature</span>
            <span className="text-[10px] text-[#625B64] font-semibold">Acknowledgement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
