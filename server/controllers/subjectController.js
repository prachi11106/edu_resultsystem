import Subject from '../models/Subject.js';
import { defaultSubjects } from '../utils/seedData.js';
import { isDbConnected, shouldUseFallback } from '../config/db.js';

let inMemorySubjects = [...defaultSubjects];

// @desc Get all subjects
// @route GET /api/subjects
export const getSubjects = async (req, res) => {
  try {
    const { class: className } = req.query;
    let subjects = [];

    if (isDbConnected()) {
      const query = className ? { class: className } : {};
      subjects = await Subject.find(query);
    } else if (shouldUseFallback()) {
      subjects = [...inMemorySubjects];
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please start MongoDB or set USE_MEMORY_FALLBACK=true in server/.env.',
      });
    }

    if (className) {
      subjects = subjects.filter((s) => s.class === className || s.class === 'All');
    }

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error('[getSubjects Error]', error);
    res.status(500).json({ success: false, message: 'Error loading subjects' });
  }
};

// @desc Add new subject template
// @route POST /api/subjects
export const createSubject = async (req, res) => {
  try {
    const { subjectName, class: className, maximumMarks, passMarks, category } = req.body;

    if (!subjectName) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    const subjectId = `SUB-${Date.now().toString().slice(-5)}`;
    const newSubData = {
      subjectId,
      subjectName: subjectName.trim(),
      class: className || 'Class 10',
      maximumMarks: Number(maximumMarks) || 100,
      passMarks: Number(passMarks) || 33,
      category: category || 'Core',
    };

    let newSub;
    if (isDbConnected()) {
      newSub = await Subject.create(newSubData);
    } else if (shouldUseFallback()) {
      newSub = { ...newSubData, _id: subjectId };
      inMemorySubjects.push(newSub);
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot create subject without database.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      data: newSub,
    });
  } catch (error) {
    console.error('[createSubject Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create subject' });
  }
};

// @desc Update subject
// @route PUT /api/subjects/:id
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedSub;

    if (isDbConnected()) {
      updatedSub = await Subject.findOneAndUpdate(
        { $or: [{ _id: id }, { subjectId: id }] },
        req.body,
        { new: true }
      );
    } else if (shouldUseFallback()) {
      const idx = inMemorySubjects.findIndex((s) => s.subjectId === id || s._id === id);
      if (idx !== -1) {
        inMemorySubjects[idx] = { ...inMemorySubjects[idx], ...req.body };
        updatedSub = inMemorySubjects[idx];
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot update subject without database.',
      });
    }

    if (!updatedSub) {
      return res.status(404).json({ success: false, message: 'Subject template not found' });
    }

    res.json({
      success: true,
      data: updatedSub,
    });
  } catch (error) {
    console.error('[updateSubject Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update subject' });
  }
};

// @desc Delete subject
// @route DELETE /api/subjects/:id
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Subject.findOneAndDelete({ $or: [{ _id: id }, { subjectId: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Subject template not found' });
      }
    } else if (shouldUseFallback()) {
      const initialLen = inMemorySubjects.length;
      inMemorySubjects = inMemorySubjects.filter((s) => s.subjectId !== id && s._id !== id);
      if (inMemorySubjects.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Subject template not found' });
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot delete subject without database.',
      });
    }

    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    console.error('[deleteSubject Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete subject' });
  }
};
