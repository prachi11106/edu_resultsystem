import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  FileEdit,
  Trash2,
  X,
  Phone,
} from 'lucide-react';
import { studentAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    admissionNumber: '',
    dateOfBirth: '2010-05-15',
    gender: 'Male',
    class: 'Class 10',
    section: 'A',
    session: '2025-26',
    fatherName: '',
    motherName: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadStudents();
  }, [search, classFilter, sectionFilter, sessionFilter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({
        search,
        class: classFilter,
        section: sectionFilter,
        session: sessionFilter,
      });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.warn('[Students Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.rollNumber || !formData.admissionNumber || !formData.fatherName || !formData.phone) {
      setFormError('Please fill out all required fields marked with *');
      return;
    }

    setSubmitting(true);
    try {
      const res = await studentAPI.create(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          rollNumber: '',
          admissionNumber: '',
          dateOfBirth: '2010-05-15',
          gender: 'Male',
          class: 'Class 10',
          section: 'A',
          session: '2025-26',
          fatherName: '',
          motherName: '',
          phone: '',
          email: '',
          address: '',
        });
        loadStudents();
      } else {
        setFormError(res.message || 'Failed to add student');
      }
    } catch (err) {
      setFormError(err.message || 'Error saving student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await studentAPI.delete(deleteId);
      setDeleteId(null);
      loadStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#40513B] flex items-center gap-2">
            <Users className="h-6 w-6 text-[#628141]" />
            <span>Student Directory</span>
          </h1>
          <p className="text-xs text-[#40513B]/70 font-medium mt-1">
            Register and manage student profiles in AnkSetu.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#628141] hover:bg-[#40513B] text-white font-bold text-xs shadow-md transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#40513B]/20 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#40513B]/60" />
          <input
            type="text"
            placeholder="Search name, roll, or admission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#E5D9B6]/50 border border-[#40513B]/20 text-xs font-semibold text-[#40513B] focus:ring-2 focus:ring-[#628141]"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#E5D9B6]/50 border border-[#40513B]/20 text-xs font-semibold text-[#40513B]"
        >
          <option value="">All Classes</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12</option>
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#E5D9B6]/50 border border-[#40513B]/20 text-xs font-semibold text-[#40513B]"
        >
          <option value="">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>

        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#E5D9B6]/50 border border-[#40513B]/20 text-xs font-semibold text-[#40513B]"
        >
          <option value="">All Sessions</option>
          <option value="2025-26">2025-26</option>
          <option value="2024-25">2024-25</option>
        </select>
      </div>

      {/* STUDENTS DATA TABLE */}
      <div className="bg-[#FAF6ED] rounded-2xl border border-[#40513B]/20 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#40513B]/15 flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#40513B] uppercase tracking-wider">
            Total Students ({students.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#40513B] text-[#E5D9B6] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Admission No</th>
                <th className="p-4">Class & Sec</th>
                <th className="p-4">Parent Details</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#40513B]/15">
              {students.map((s) => (
                <tr key={s._id || s.studentId} className="hover:bg-white transition-colors">
                  <td className="p-4 font-extrabold text-[#628141]">{s.rollNumber}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-[#40513B]">{s.name}</div>
                    <div className="text-[10px] text-[#40513B]/70 font-medium">{s.gender} • DOB: {s.dateOfBirth}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#40513B]">{s.admissionNumber}</td>
                  <td className="p-4 text-[#40513B] font-bold">
                    {s.class} - {s.section}
                  </td>
                  <td className="p-4 text-[#40513B]">
                    <div className="font-bold">{s.fatherName}</div>
                    <div className="text-[10px] text-[#40513B]/70 font-medium">Mother: {s.motherName || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-[#40513B] font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#628141]" />
                    <span>{s.phone}</span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => navigate(`/students/${s.studentId || s._id}`)}
                      className="p-1.5 rounded-lg text-[#40513B] hover:text-[#628141] hover:bg-[#E5D9B6] transition-colors"
                      title="View Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/marks-entry?studentId=${s.studentId || s._id}`)}
                      className="p-1.5 rounded-lg text-[#40513B] hover:text-[#628141] hover:bg-[#E5D9B6] transition-colors"
                      title="Enter Marks"
                    >
                      <FileEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(s.studentId || s._id)}
                      className="p-1.5 rounded-lg text-[#40513B] hover:text-[#E67E22] hover:bg-[#E5D9B6] transition-colors"
                      title="Delete Student"
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

      {/* ADD STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF6ED] text-[#40513B] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-[#40513B] overflow-hidden my-8">
            <div className="p-6 bg-[#40513B] text-white flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#E67E22]" />
                <span>Add Student Registration</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#E5D9B6] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-[#E67E22]/20 border border-[#E67E22] text-[#E67E22] text-xs font-bold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Patel"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 1001"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Admission Number *
                  </label>
                  <input
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. ADM-2025-11"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Class *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Section *
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="Father Name"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    placeholder="Mother Name"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#40513B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@school.edu"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#40513B] mb-1">
                  Residential Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full street address..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#E5D9B6]/40 border border-[#40513B]/30 font-semibold text-[#40513B]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#40513B]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#E5D9B6] text-[#40513B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#628141] hover:bg-[#40513B] text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message="Are you sure you want to delete this student and their historical results? This action cannot be reverted."
        loading={deleting}
      />
    </div>
  );
};

export default Students;
