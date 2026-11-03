import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  Eye,
  GraduationCap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import KPICard from '../components/KPICard';
import { analyticsAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.warn('[Dashboard Load Error]', err);
    }
  };

  const kpis = dashboardData?.kpis || {
    totalStudents: 10,
    totalResultsGenerated: 5,
    avgPercentage: 73.2,
    passPercentage: 80.0,
    needingImprovementCount: 2,
  };

  const subjectData = dashboardData?.charts?.averageBySubject || [
    { subject: 'English Core', averagePercentage: 74 },
    { subject: 'Mathematics', averagePercentage: 69 },
    { subject: 'Science', averagePercentage: 65 },
    { subject: 'Social Studies', averagePercentage: 73 },
    { subject: 'Computer', averagePercentage: 81 },
  ];

  const gradeDistribution = dashboardData?.charts?.gradeDistribution || [
    { grade: 'A+', count: 1 },
    { grade: 'A', count: 2 },
    { grade: 'B+', count: 1 },
    { grade: 'B', count: 1 },
    { grade: 'C', count: 0 },
    { grade: 'D', count: 0 },
    { grade: 'F', count: 1 },
  ];

  const passVsFail = [
    { status: 'Passed (PASS)', count: kpis.totalResultsGenerated - kpis.needingImprovementCount, color: '#00264D' },
    { status: 'Needs Support (FAIL)', count: kpis.needingImprovementCount, color: '#FF7F00' },
  ];

  const recentResults = dashboardData?.recentResults || [];
  const topPerformers = dashboardData?.charts?.topPerformers || [];
  const needingImprovementList = dashboardData?.charts?.needingImprovementList || [];

  return (
    <div className="space-y-6 pb-12">
      {/* BRAND OVERVIEW BANNER */}
      <div className="bg-[#00264D] p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden border border-[#001D3D]">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-[#FF7F00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF7F00] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF7F00] animate-pulse"></span>
                ANKSETU • Academic Portal
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-300">• Session 2025-26</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
              Academic Performance Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              "Smart Results. Better Insights. Stronger Students."
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-right">
            <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Class In-Charge</span>
              <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                <GraduationCap className="h-3.5 w-3.5 text-[#FF7F00]" />
                Class 10 (Section A)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 MANDATORY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Students"
          value={kpis.totalStudents}
          subtitle="Enrolled active session"
          icon={Users}
          variant="surface"
          trend={{ isPositive: true, text: 'Active' }}
        />
        <KPICard
          title="Average Percentage"
          value={`${kpis.avgPercentage}%`}
          subtitle="School average score"
          icon={TrendingUp}
          variant="positive"
          trend={{ isPositive: kpis.avgPercentage >= 70, text: 'Class Avg' }}
        />
        <KPICard
          title="Pass Percentage"
          value={`${kpis.passPercentage}%`}
          subtitle="Qualified students"
          icon={Award}
          variant="analytics"
          trend={{ isPositive: kpis.passPercentage >= 75, text: 'Qualified' }}
        />
        <KPICard
          title="Needing Support"
          value={kpis.needingImprovementCount}
          subtitle="Below pass threshold • Click to view"
          icon={AlertCircle}
          variant="ai"
          trend={{ isPositive: false, text: 'Action Needed' }}
          onClick={() => navigate('/needing-support')}
        />
      </div>

      {/* CHARTS SECTION USING ANKSETU LOGO PALETTE (#00264D Navy & #FF7F00 Orange) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Subject-Wise Performance Overview
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Average marks percentage across registered subjects
              </p>
            </div>
            <span className="text-xs font-bold text-[#00264D] bg-[#EBF2FA] px-2.5 py-1 rounded-lg">
              Class 10
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#00264D', borderColor: '#001D3D', borderRadius: '12px', color: '#FFFFFF' }}
                  formatter={(val) => [`${val}%`, 'Average Score']}
                />
                <Bar dataKey="averagePercentage" fill="#00264D" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass vs Fail Ratio Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Pass vs Fail Ratio
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Overall student qualification
            </p>

            <div className="h-48 w-full my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passVsFail}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {passVsFail.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#00264D', borderColor: '#001D3D', borderRadius: '12px', color: '#FFFFFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {passVsFail.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-semibold text-slate-700">{item.status}</span>
                </div>
                <span className="font-bold text-slate-900">{item.count} Students</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECOND ROW CHARTS & LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Grade Distribution (A+ to F)
            </h3>
            <p className="text-xs text-slate-500 font-medium">Students per grade tier</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="grade" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#00264D', borderRadius: '12px', color: '#FFFFFF' }} />
                <Bar dataKey="count" fill="#FF7F00" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-[#FF7F00]" />
              <span>Top Performers</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ranked by %</span>
          </div>

          <div className="space-y-2.5">
            {topPerformers.slice(0, 4).map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#00264D] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{p.studentName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Roll: {p.rollNumber} • {p.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#00264D]">{p.percentage}%</span>
                  <span className="block text-[10px] font-bold text-[#FF7F00]">{p.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Needing Improvement */}
        <div
          onClick={() => navigate('/needing-support')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/needing-support');
            }
          }}
          className="bg-white p-6 rounded-2xl border border-orange-200 shadow-xs space-y-4 text-slate-900 cursor-pointer hover:border-[#FF7F00] hover:ring-2 hover:ring-[#FF7F00]/20 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2 group-hover:text-[#FF7F00] transition-colors">
              <AlertCircle className="h-4 w-4 text-[#FF7F00]" />
              <span>Needing Support</span>
            </h3>
            <span className="text-[10px] font-bold text-[#FF7F00] uppercase bg-[#FFF7ED] group-hover:bg-[#FF7F00] group-hover:text-white px-2 py-0.5 rounded border border-[#FED7AA] transition-colors flex items-center gap-1">
              <span>View Overview</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          <div className="space-y-2.5">
            {needingImprovementList.length > 0 ? (
              needingImprovementList.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF7ED]/50 border border-orange-200"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{s.studentName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Roll: {s.rollNumber} • {s.class}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600">{s.percentage}%</span>
                    <span className="block text-[10px] font-semibold text-slate-500">Below 33%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6 font-medium">All students currently meeting academic threshold!</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT RESULTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Recent Student Report Cards
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Latest generated report cards in AnkSetu System
            </p>
          </div>

          <button
            onClick={() => navigate('/results')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#00264D] hover:text-[#FF7F00] transition-colors"
          >
            <span>View All Results</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Student Name</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Class</th>
                <th className="p-4 text-center">Percentage</th>
                <th className="p-4 text-center">Grade</th>
                <th className="p-4 text-center">Result Status</th>
                <th className="p-4">Generated Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{r.studentName}</td>
                  <td className="p-4 text-slate-600 font-medium">{r.rollNumber}</td>
                  <td className="p-4 text-slate-600 font-medium">{r.class}</td>
                  <td className="p-4 text-center font-extrabold text-[#00264D]">{r.percentage}%</td>
                  <td className="p-4 text-center font-bold text-slate-800">{r.grade}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.resultStatus === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {r.resultStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{r.generatedDate}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/results/${r.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Result</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
