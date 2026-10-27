import Student from '../models/Student.js';
import Result from '../models/Result.js';
import { initialStudents } from '../utils/seedData.js';
import { isDbConnected, shouldUseFallback } from '../config/db.js';

let inMemoryStudents = [...initialStudents];

// @desc Get all students
// @route GET /api/students
export const getStudents = async (req, res) => {
  try {
    const { search, class: className, section, session } = req.query;
    let students = [];

    if (isDbConnected()) {
      let query = {};
      if (className) query.class = className;
      if (section) query.section = section;
      if (session) query.session = session;

      students = await Student.find(query).sort({ rollNumber: 1 });
    } else if (shouldUseFallback()) {
      students = [...inMemoryStudents];
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please start MongoDB or set USE_MEMORY_FALLBACK=true in server/.env.',
      });
    }

    // Client filtering / search
    if (search || className || section || session) {
      const q = (search || '').toLowerCase().trim();
      students = students.filter((s) => {
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q);
        const matchesClass = !className || s.class === className;
        const matchesSection = !section || s.section === section;
        const matchesSession = !session || s.session === session;

        return matchesSearch && matchesClass && matchesSection && matchesSession;
      });
    }

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('[getStudents Error]', error);
    res.status(500).json({ success: false, message: 'Error retrieving students' });
  }
};

// @desc Get single student profile with result trends
// @route GET /api/students/:id
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;
    let results = [];

    if (isDbConnected()) {
      student = await Student.findOne({ $or: [{ _id: id }, { studentId: id }] });
      if (student) {
        results = await Result.find({
          $or: [{ studentId: student.studentId }, { studentId: student._id }],
        }).sort({ createdAt: 1 });
      }
    } else if (shouldUseFallback()) {
      student = inMemoryStudents.find((s) => s.studentId === id || s._id === id);
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please start MongoDB or set USE_MEMORY_FALLBACK=true in server/.env.',
      });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      data: student,
      resultsHistory: results,
    });
  } catch (error) {
    console.error('[getStudentById Error]', error);
    res.status(500).json({ success: false, message: 'Error fetching student details' });
  }
};

// @desc Create new student
// @route POST /api/students
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      admissionNumber,
      dateOfBirth,
      gender,
      class: className,
      section,
      session,
      fatherName,
      motherName,
      phone,
      email,
      address,
    } = req.body;

    if (!name || !rollNumber || !admissionNumber || !className || !fatherName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields (Name, Roll No, Admission No, Class, Father Name, Phone)',
      });
    }

    // Check unique admission & roll number
    let existingStudent = null;
    if (isDbConnected()) {
      existingStudent = await Student.findOne({
        $or: [
          { admissionNumber: admissionNumber.trim() },
          { rollNumber: rollNumber.trim(), class: className, section: section || 'A' },
        ],
      });
    } else if (shouldUseFallback()) {
      existingStudent = inMemoryStudents.find(
        (s) =>
          s.admissionNumber === admissionNumber.trim() ||
          (s.rollNumber === rollNumber.trim() && s.class === className && s.section === (section || 'A'))
      );
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot create student without database.',
      });
    }

    if (existingStudent) {
      if (existingStudent.admissionNumber === admissionNumber.trim()) {
        return res.status(400).json({ success: false, message: `Admission number '${admissionNumber}' already exists.` });
      }
      return res.status(400).json({
        success: false,
        message: `Roll number '${rollNumber}' already exists in ${className} Section ${section || 'A'}.`,
      });
    }

    const studentId = `STU-${Date.now().toString().slice(-6)}`;
    const studentData = {
      studentId,
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      admissionNumber: admissionNumber.trim(),
      dateOfBirth: dateOfBirth || '2010-01-01',
      gender: gender || 'Male',
      class: className,
      section: section || 'A',
      session: session || '2025-26',
      fatherName: fatherName.trim(),
      motherName: motherName ? motherName.trim() : 'N/A',
      phone: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
    };

    let newStudent;
    if (isDbConnected()) {
      newStudent = await Student.create(studentData);
    } else if (shouldUseFallback()) {
      newStudent = { ...studentData, _id: studentId, createdAt: new Date() };
      inMemoryStudents.unshift(newStudent);
    }

    res.status(201).json({
      success: true,
      message: 'Student record added successfully',
      data: newStudent,
    });
  } catch (error) {
    console.error('[createStudent Error]', error);
    res.status(500).json({ success: false, message: 'Failed to save student details' });
  }
};

// @desc Update student
// @route PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedStudent;

    if (isDbConnected()) {
      updatedStudent = await Student.findOneAndUpdate(
        { $or: [{ _id: id }, { studentId: id }] },
        req.body,
        { new: true }
      );
    } else if (shouldUseFallback()) {
      const idx = inMemoryStudents.findIndex((s) => s.studentId === id || s._id === id);
      if (idx !== -1) {
        inMemoryStudents[idx] = { ...inMemoryStudents[idx], ...req.body };
        updatedStudent = inMemoryStudents[idx];
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot update student without database.',
      });
    }

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student record updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('[updateStudent Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update student profile' });
  }
};

// @desc Delete student
// @route DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Student.findOneAndDelete({ $or: [{ _id: id }, { studentId: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }
      await Result.deleteMany({ $or: [{ studentId: id }] });
    } else if (shouldUseFallback()) {
      const initialLen = inMemoryStudents.length;
      inMemoryStudents = inMemoryStudents.filter((s) => s.studentId !== id && s._id !== id);
      if (inMemoryStudents.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot delete student without database.',
      });
    }

    res.json({
      success: true,
      message: 'Student record deleted successfully',
    });
  } catch (error) {
    console.error('[deleteStudent Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete student record' });
  }
};
