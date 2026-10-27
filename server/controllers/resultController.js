import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Settings from '../models/Settings.js';
import { calculateResultData } from '../services/calculationService.js';
import { generateAIAnalysis } from '../services/aiService.js';
import { initialResults } from '../utils/seedData.js';
import { isDbConnected, shouldUseFallback } from '../config/db.js';

let inMemoryResults = [...initialResults];

// @desc Get all results with search, filter, and sort
// @route GET /api/results
export const getResults = async (req, res) => {
  try {
    const {
      search,
      class: className,
      section,
      session,
      grade,
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let results = [];

    if (isDbConnected()) {
      let query = {};
      if (className) query.class = className;
      if (section) query.section = section;
      if (session) query.session = session;
      if (grade) query.grade = grade;
      if (status) query.resultStatus = status;

      results = await Result.find(query).sort({ [sortBy]: order === 'asc' ? 1 : -1 });
    } else if (shouldUseFallback()) {
      results = [...inMemoryResults];
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please start MongoDB or set USE_MEMORY_FALLBACK=true in server/.env.',
      });
    }

    // Filter memory or secondary search
    let filtered = [...results];
    if (search || className || section || session || grade || status) {
      const q = (search || '').toLowerCase().trim();
      filtered = filtered.filter((r) => {
        const studentName = r.studentDetails?.name || r.studentName || '';
        const rollNo = r.studentDetails?.rollNumber || r.rollNumber || '';
        const admNo = r.studentDetails?.admissionNumber || r.admissionNumber || '';

        const matchesSearch =
          !q ||
          studentName.toLowerCase().includes(q) ||
          rollNo.toLowerCase().includes(q) ||
          admNo.toLowerCase().includes(q);

        const matchesClass = !className || r.class === className;
        const matchesSection = !section || r.section === section;
        const matchesSession = !session || r.session === session;
        const matchesGrade = !grade || r.grade === grade;
        const matchesStatus = !status || r.resultStatus === status;

        return (
          matchesSearch &&
          matchesClass &&
          matchesSection &&
          matchesSession &&
          matchesGrade &&
          matchesStatus
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'percentage') {
        return order === 'asc' ? a.percentage - b.percentage : b.percentage - a.percentage;
      }
      const dateA = new Date(a.generatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.generatedAt || b.createdAt || 0).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('[getResults Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve results' });
  }
};

// @desc Get single result report card
// @route GET /api/results/:id
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = null;

    if (isDbConnected()) {
      result = await Result.findOne({ $or: [{ _id: id }, { resultId: id }] });
    } else if (shouldUseFallback()) {
      result = inMemoryResults.find((r) => r.resultId === id || r._id === id);
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please start MongoDB or set USE_MEMORY_FALLBACK=true in server/.env.',
      });
    }

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result report card not found' });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[getResultById Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch result card' });
  }
};

// @desc Create and save student result
// @route POST /api/results
export const createResult = async (req, res) => {
  try {
    const { studentId, session, class: className, section, subjects, teacherRemark, attendance } = req.body;

    if (!studentId || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid student and at least one subject mark entry.',
      });
    }

    // Validate marks non-negative and obtained <= maximum
    for (const sub of subjects) {
      const maxM = Number(sub.maximumMarks) || 100;
      const obtM = Number(sub.obtainedMarks);

      if (isNaN(obtM) || obtM < 0) {
        return res.status(400).json({
          success: false,
          message: `Obtained marks for '${sub.subjectName}' cannot be negative or invalid.`,
        });
      }
      if (obtM > maxM) {
        return res.status(400).json({
          success: false,
          message: `Obtained marks (${obtM}) for '${sub.subjectName}' cannot exceed maximum marks (${maxM}).`,
        });
      }
    }

    if (!isDbConnected() && !shouldUseFallback()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot create result without database.',
      });
    }

    // Load student metadata
    let student = null;
    if (isDbConnected()) {
      student = await Student.findOne({ $or: [{ _id: studentId }, { studentId }] });
    }

    const studentDetails = {
      name: student?.name || req.body.studentName || 'Student',
      rollNumber: student?.rollNumber || req.body.rollNumber || 'N/A',
      admissionNumber: student?.admissionNumber || req.body.admissionNumber || 'N/A',
      fatherName: student?.fatherName || req.body.fatherName || 'N/A',
      motherName: student?.motherName || req.body.motherName || 'N/A',
      dateOfBirth: student?.dateOfBirth || req.body.dateOfBirth || 'N/A',
      phone: student?.phone || req.body.phone || 'N/A',
      email: student?.email || req.body.email || '',
    };

    // Load school settings for pass mark & grading rules
    let settings = null;
    if (isDbConnected()) {
      settings = await Settings.findOne();
    }

    // Run backend calculation engine
    const calculated = calculateResultData(subjects, {
      passMarkPct: settings?.defaultPassMarkPercentage || 33,
      gradingRules: settings?.gradingRules,
    });

    // Run AI analysis
    const aiAnalysis = await generateAIAnalysis({
      studentName: studentDetails.name,
      percentage: calculated.percentage,
      subjects: calculated.subjects,
      grade: calculated.grade,
      resultStatus: calculated.resultStatus,
    });

    const resultId = `RES-${Date.now().toString().slice(-6)}`;
    const resultPayload = {
      resultId,
      studentId: student?.studentId || studentId,
      studentDetails,
      session: session || student?.session || '2025-26',
      class: className || student?.class || 'Class 10',
      section: section || student?.section || 'A',
      subjects: calculated.subjects,
      totalMarks: calculated.totalMarks,
      obtainedMarks: calculated.obtainedMarks,
      percentage: calculated.percentage,
      grade: calculated.grade,
      resultStatus: calculated.resultStatus,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      teacherRemark: teacherRemark || aiAnalysis.overallRemark,
      aiSuggestions: aiAnalysis.aiSuggestions,
      attendance: attendance || {
        totalWorkingDays: 200,
        daysPresent: 185,
        attendancePercentage: 92.5,
      },
      generatedAt: new Date(),
    };

    let newResult;
    if (isDbConnected()) {
      newResult = await Result.create(resultPayload);
    } else if (shouldUseFallback()) {
      newResult = { ...resultPayload, _id: resultId };
      inMemoryResults.unshift(newResult);
    }

    res.status(201).json({
      success: true,
      message: 'Result calculated and saved successfully',
      data: newResult,
    });
  } catch (error) {
    console.error('[createResult Error]', error);
    res.status(500).json({ success: false, message: 'Failed to calculate and save result' });
  }
};

// @desc Update an existing result
// @route PUT /api/results/:id
export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects, teacherRemark, attendance, session, class: className, section } = req.body;

    let existingResult;
    if (isDbConnected()) {
      existingResult = await Result.findOne({ $or: [{ _id: id }, { resultId: id }] });
    } else if (shouldUseFallback()) {
      existingResult = inMemoryResults.find((r) => r.resultId === id || r._id === id);
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot update result without database.',
      });
    }

    if (!existingResult) {
      return res.status(404).json({ success: false, message: 'Result record not found' });
    }

    let calculated = {
      subjects: existingResult.subjects,
      totalMarks: existingResult.totalMarks,
      obtainedMarks: existingResult.obtainedMarks,
      percentage: existingResult.percentage,
      grade: existingResult.grade,
      resultStatus: existingResult.resultStatus,
    };

    let aiAnalysis = {
      strengths: existingResult.strengths,
      weaknesses: existingResult.weaknesses,
      aiSuggestions: existingResult.aiSuggestions,
    };

    if (subjects && Array.isArray(subjects)) {
      for (const sub of subjects) {
        const maxM = Number(sub.maximumMarks) || 100;
        const obtM = Number(sub.obtainedMarks);
        if (isNaN(obtM) || obtM < 0 || obtM > maxM) {
          return res.status(400).json({
            success: false,
            message: `Invalid obtained marks (${obtM}) for '${sub.subjectName}'. Must be between 0 and ${maxM}.`,
          });
        }
      }

      calculated = calculateResultData(subjects);
      aiAnalysis = await generateAIAnalysis({
        studentName: existingResult.studentDetails?.name || 'Student',
        percentage: calculated.percentage,
        subjects: calculated.subjects,
        grade: calculated.grade,
        resultStatus: calculated.resultStatus,
      });
    }

    const updatePayload = {
      subjects: calculated.subjects,
      totalMarks: calculated.totalMarks,
      obtainedMarks: calculated.obtainedMarks,
      percentage: calculated.percentage,
      grade: calculated.grade,
      resultStatus: calculated.resultStatus,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      aiSuggestions: aiAnalysis.aiSuggestions,
      teacherRemark: teacherRemark !== undefined ? teacherRemark : existingResult.teacherRemark,
      attendance: attendance || existingResult.attendance,
      session: session || existingResult.session,
      class: className || existingResult.class,
      section: section || existingResult.section,
      updatedAt: new Date(),
    };

    let updatedResult;
    if (isDbConnected()) {
      updatedResult = await Result.findOneAndUpdate(
        { $or: [{ _id: id }, { resultId: id }] },
        updatePayload,
        { new: true }
      );
    } else if (shouldUseFallback()) {
      const idx = inMemoryResults.findIndex((r) => r.resultId === id || r._id === id);
      if (idx !== -1) {
        inMemoryResults[idx] = { ...inMemoryResults[idx], ...updatePayload };
        updatedResult = inMemoryResults[idx];
      }
    }

    res.json({
      success: true,
      message: 'Result report card updated successfully',
      data: updatedResult,
    });
  } catch (error) {
    console.error('[updateResult Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update result record' });
  }
};

// @desc Delete result record
// @route DELETE /api/results/:id
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Result.findOneAndDelete({ $or: [{ _id: id }, { resultId: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Result record not found' });
      }
    } else if (shouldUseFallback()) {
      const initialLen = inMemoryResults.length;
      inMemoryResults = inMemoryResults.filter((r) => r.resultId !== id && r._id !== id);
      if (inMemoryResults.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Result record not found' });
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot delete result without database.',
      });
    }

    res.json({
      success: true,
      message: 'Result record deleted successfully',
    });
  } catch (error) {
    console.error('[deleteResult Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete result record' });
  }
};

// @desc Standalone performance analysis trigger
// @route POST /api/results/analyze
export const analyzePerformance = async (req, res) => {
  try {
    const { studentName, subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide subjects array to analyze' });
    }

    const calculated = calculateResultData(subjects);
    const aiAnalysis = await generateAIAnalysis({
      studentName: studentName || 'Student',
      percentage: calculated.percentage,
      subjects: calculated.subjects,
      grade: calculated.grade,
      resultStatus: calculated.resultStatus,
    });

    res.json({
      success: true,
      calculation: calculated,
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error('[analyzePerformance Error]', error);
    res.status(500).json({ success: false, message: 'Performance analysis failed' });
  }
};
