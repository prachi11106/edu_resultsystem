import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  TrendingUp,
  Award,
  AlertCircle,
  PlusCircle,
  FileEdit,
  Sparkles,
  History,
  ArrowRight,
  Eye,
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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.warn('[Dashboard Load Error]', err);
    } finally {
      setLoading(false);
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
    { status: 'Passed (PASS)', count: kpis.totalResultsGenerated - kpis.needingImprovementCount, color: '#F5CBCB' },
    { status: 'Needs Support (FAIL)', count: kpis.needingImprovementCount, color: '#C5B3D3' },
  ];

  const recentResults = dashboardData?.recentResults || [];
  const topPerformers = dashboardData?.charts?.topPerformers || [];
  const needingImprovementList = dashboardData?.charts?.needingImprovementList || [];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER (#C5B3D3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#C5B3D3] p-6 sm:p-8 rounded-3xl text-[#332F35] shadow-sm border border-[#F5CBCB]">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F5CBCB] text-[#332F35] text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-white">
            ANKSETU • Teacher Overview
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[#332F35]">
            Academic Performance Dashboard
          </h1>
          <p className="text-[#332F35]/80 text-xs sm:text-sm mt-1 max-w-xl font-semibold italic">
            "Smart Results. Better Insights. Stronger Students."
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/marks-entry')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5CBCB] hover:bg-white text-[#332F35] font-extrabold text-xs shadow-xs transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Enter Marks</span>
          </button>
          <button
            onClick={() => navigate('/result-analysis')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5CBCB] text-[#332F35] font-extrabold text-xs shadow-xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-[#332F35]" />
            <span>AI Hub</span>
          </button>
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
          subtitle="Below pass threshold"
          icon={AlertCircle}
          variant="ai"
          trend={{ isPositive: false, text: 'AI Plan Needed' }}
        />
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="p-4 rounded-2xl bg-[#FFE2E2] border border-[#F5CBCB] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#332F35]">
          Quick Workflows:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5CBCB] text-[#332F35] text-xs font-bold transition-colors shadow-2xs"
          >
            <Users className="h-3.5 w-3.5 text-[#625B64]" />
            <span>Manage Students</span>
          </button>
          <button
            onClick={() => navigate('/marks-entry')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5CBCB] text-[#332F35] text-xs font-bold transition-colors shadow-2xs"
          >
            <FileEdit className="h-3.5 w-3.5 text-[#625B64]" />
            <span>Enter Marks</span>
          </button>
          <button
            onClick={() => navigate('/result-analysis')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C5B3D3] hover:bg-[#F5CBCB] text-[#332F35] text-xs font-extrabold transition-colors shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Analysis</span>
          </button>
          <button
            onClick={() => navigate('/results')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5CBCB] text-[#332F35] text-xs font-bold transition-colors shadow-2xs"
          >
            <History className="h-3.5 w-3.5 text-[#625B64]" />
            <span>Result History</span>
          </button>
        </div>
      </div>

      {/* CHARTS SECTION USING PASTEL PALETTE (#F5CBCB primary, #C5B3D3 secondary, #FFE2E2 background) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#F5CBCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#332F35]">
                Subject-Wise Performance Overview
              </h3>
              <p className="text-xs text-[#625B64] font-medium">
                Average marks percentage across registered subjects
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#332F35] bg-[#F5CBCB] px-2.5 py-1 rounded-lg">
              Class 10
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFE2E2" />
                <XAxis dataKey="subject" tick={{ fill: '#332F35', fontSize: 11, fontWeight: 700 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#625B64', fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#F5CBCB', borderRadius: '12px', color: '#332F35' }}
                  formatter={(val) => [`${val}%`, 'Average Score']}
                />
                <Bar dataKey="averagePercentage" fill="#F5CBCB" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass vs Fail Ratio Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#F5CBCB] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#332F35]">
              Pass vs Fail Ratio
            </h3>
            <p className="text-xs text-[#625B64] font-medium">
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
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {passVsFail.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#F5CBCB', borderRadius: '12px', color: '#332F35' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#FFE2E2] text-xs">
            {passVsFail.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-bold text-[#332F35]">{item.status}</span>
                </div>
                <span className="font-extrabold text-[#332F35]">{item.count} Students</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECOND ROW CHARTS & LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Bar Chart (#C5B3D3 secondary chart fill) */}
        <div className="bg-white p-6 rounded-2xl border border-[#F5CBCB] shadow-xs space-y-4">
          <h3 className="font-heading font-extrabold text-base text-[#332F35]">
            Grade Distribution (A+ to F)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <XAxis dataKey="grade" tick={{ fill: '#332F35', fontSize: 11, fontWeight: 700 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#625B64', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', color: '#332F35' }} />
                <Bar dataKey="count" fill="#C5B3D3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers List */}
        <div className="bg-white p-6 rounded-2xl border border-[#F5CBCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-[#332F35] flex items-center gap-2">
              <Award className="h-4 w-4 text-[#F5CBCB]" />
              <span>Top Performers</span>
            </h3>
            <span className="text-[10px] font-extrabold text-[#625B64] uppercase">Ranked by %</span>
          </div>

          <div className="space-y-2.5">
            {topPerformers.slice(0, 4).map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFE2E2]/60 border border-[#F5CBCB]"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#F5CBCB] text-[#332F35] font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-[#332F35]">{p.studentName}</p>
                    <p className="text-[10px] text-[#625B64] font-medium">Roll: {p.rollNumber} • {p.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#332F35]">{p.percentage}%</span>
                  <span className="block text-[10px] font-bold text-[#625B64]">{p.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Needing Improvement (#C5B3D3 AI Card surface) */}
        <div className="bg-[#C5B3D3] p-6 rounded-2xl border border-white shadow-xs space-y-4 text-[#332F35]">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-[#332F35] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#332F35]" />
              <span>Needing Support</span>
            </h3>
            <span className="text-[10px] font-extrabold text-[#332F35] uppercase bg-[#FFFFFF] px-2 py-0.5 rounded">AI Action</span>
          </div>

          <div className="space-y-2.5">
            {needingImprovementList.length > 0 ? (
              needingImprovementList.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#F5CBCB]"
                >
                  <div>
                    <p className="text-xs font-extrabold text-[#332F35]">{s.studentName}</p>
                    <p className="text-[10px] text-[#625B64] font-medium">Roll: {s.rollNumber} • {s.class}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#332F35]">{s.percentage}%</span>
                    <button
                      onClick={() => navigate('/result-analysis')}
                      className="block text-[10px] font-extrabold text-[#332F35] hover:underline mt-0.5"
                    >
                      AI Plan →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#332F35] text-center py-6 font-semibold">All students currently meeting academic threshold!</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT RESULTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#F5CBCB] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#FFE2E2] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#332F35]">
              Recent Student Report Cards
            </h3>
            <p className="text-xs text-[#625B64] font-medium">
              Latest generated report cards in AnkSetu System
            </p>
          </div>

          <button
            onClick={() => navigate('/results')}
            className="flex items-center gap-1 text-xs font-extrabold text-[#332F35] hover:text-[#625B64]"
          >
            <span>View All History</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFE2E2] text-[#332F35] font-extrabold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-[#FFE2E2]">
              {recentResults.map((r) => (
                <tr key={r.id} className="hover:bg-[#FBEFEF] transition-colors">
                  <td className="p-4 font-bold text-[#332F35]">{r.studentName}</td>
                  <td className="p-4 text-[#625B64] font-medium">{r.rollNumber}</td>
                  <td className="p-4 text-[#625B64] font-medium">{r.class}</td>
                  <td className="p-4 text-center font-extrabold text-[#332F35]">{r.percentage}%</td>
                  <td className="p-4 text-center font-bold text-[#332F35]">{r.grade}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        r.resultStatus === 'PASS'
                          ? 'bg-[#F5CBCB] text-[#332F35]'
                          : 'bg-[#FFE2E2] text-[#332F35] border border-[#F5CBCB]'
                      }`}
                    >
                      {r.resultStatus}
                    </span>
                  </td>
                  <td className="p-4 text-[#625B64] font-medium">{r.generatedDate}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/results/${r.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F5CBCB] hover:bg-[#C5B3D3] text-[#332F35] text-xs font-extrabold transition-colors shadow-2xs"
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
