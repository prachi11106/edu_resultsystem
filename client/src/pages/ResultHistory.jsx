import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Eye,
  FileEdit,
  Trash2,
  ArrowUpDown,
  PlusCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { resultAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const Result = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(querySearch);
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Deletion state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadResults();
  }, [search, classFilter, sectionFilter, sessionFilter, gradeFilter, statusFilter, sortBy, sortOrder]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const res = await resultAPI.getAll({
        search,
        class: classFilter,
        section: sectionFilter,
        session: sessionFilter,
        grade: gradeFilter,
        status: statusFilter,
        sortBy,
        order: sortOrder,
      });
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.warn('[Result Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await resultAPI.delete(deleteId);
      setDeleteId(null);
      loadResults();
    } catch (err) {
      alert(err.message || 'Failed to delete result record');
    } finally {
      setDeleting(false);
    }
  };

  const passedCount = results.filter((r) => r.resultStatus === 'PASS').length;
  const avgPct = results.length > 0
    ? (results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / results.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-[#00264D]" />
            <span>Result</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student Academic Results, Historical Performance Records & Official Archives.
          </p>
        </div>

        <button
          onClick={() => navigate('/marks-entry')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white text-xs font-bold shadow-md shadow-[#00264D]/15 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Result / Marks Entry</span>
        </button>
      </div>

      {/* QUICK RESULT STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00264D]/10 text-[#00264D]">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Records</span>
            <span className="text-xl font-extrabold text-slate-900">{results.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Passed Students</span>
            <span className="text-xl font-extrabold text-slate-900">{passedCount} <span className="text-xs font-medium text-slate-400">({results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0}%)</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF7F00]/10 text-[#FF7F00]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average Score</span>
            <span className="text-xl font-extrabold text-slate-900">{avgPct}%</span>
          </div>
        </div>
      </div>

      {/* MULTI-FILTER CONTROL BAR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#FF7F00] transition-all outline-none"
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
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#FF7F00] transition-all outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PASS">Pass Only</option>
            <option value="FAIL">Fail / Support Only</option>
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#FF7F00] transition-all outline-none"
          >
            <option value="">All Grades</option>
            <option value="A+">Grade A+</option>
            <option value="A">Grade A</option>
            <option value="B+">Grade B+</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="F">Grade F</option>
          </select>
        </div>
      </div>

      {/* RESULTS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Student Results & Historical Records ({results.length})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSort('percentage')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00264D] transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Sort by % ({sortBy === 'percentage' ? sortOrder : 'off'})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Student Name</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Class</th>
                <th className="p-4 text-center">Percentage</th>
                <th className="p-4 text-center">Grade</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Generated Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No result records found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r._id || r.resultId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      {r.studentDetails?.name || 'Student'}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {r.studentDetails?.rollNumber || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {r.class} ({r.section})
                    </td>
                    <td className="p-4 text-center font-extrabold text-[#00264D]">
                      {r.percentage}%
                    </td>
                    <td className="p-4 text-center font-bold text-[#FF7F00]">
                      {r.grade}
                    </td>
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
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(r.generatedAt || r.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/results/${r._id || r.resultId}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#00264D] hover:bg-[#00264D]/10 transition-colors"
                        title="View Report Card"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/marks-entry?studentId=${r.studentId}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Edit Marks"
                      >
                        <FileEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(r._id || r.resultId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Result"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Result Report Card"
        message="Are you sure you want to permanently delete this generated report card record?"
        loading={deleting}
      />
    </div>
  );
};

export default Result;
