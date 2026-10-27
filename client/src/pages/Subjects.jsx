import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import { subjectAPI } from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: '',
    class: 'Class 10',
    maximumMarks: 100,
    passMarks: 33,
    category: 'Core',
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectAPI.getAll();
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.warn('[Subjects Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName.trim()) return;

    try {
      const res = await subjectAPI.create(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          subjectName: '',
          class: 'Class 10',
          maximumMarks: 100,
          passMarks: 33,
          category: 'Core',
        });
        loadSubjects();
      }
    } catch (err) {
      alert(err.message || 'Failed to create subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete subject template?')) {
      try {
        await subjectAPI.delete(id);
        loadSubjects();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>Curriculum Subjects Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage subject templates, default maximum marks, and pass thresholds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject Template</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Subject Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Max Marks</th>
                <th className="p-4 text-center">Pass Marks</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map((sub) => (
                <tr key={sub._id || sub.subjectId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{sub.subjectName}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{sub.class}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
                      {sub.category || 'Core'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-900 dark:text-white">{sub.maximumMarks}</td>
                  <td className="p-4 text-center font-bold text-emerald-600">{sub.passMarks}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(sub._id || sub.subjectId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Add New Subject Template
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  placeholder="e.g. Physics"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={formData.maximumMarks}
                    onChange={(e) => setFormData({ ...formData, maximumMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-sm"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
