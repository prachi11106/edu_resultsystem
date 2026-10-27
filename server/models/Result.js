import mongoose from 'mongoose';

const subjectScoreSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  maximumMarks: { type: Number, required: true, default: 100 },
  obtainedMarks: { type: Number, required: true, default: 0 },
  percentage: { type: Number, required: true, default: 0 },
  grade: { type: String, required: true, default: 'F' },
  status: { type: String, required: true, enum: ['PASS', 'FAIL'], default: 'PASS' },
});

const resultSchema = new mongoose.Schema(
  {
    resultId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      ref: 'Student',
    },
    studentDetails: {
      name: String,
      rollNumber: String,
      admissionNumber: String,
      fatherName: String,
      motherName: String,
      dateOfBirth: String,
      phone: String,
      email: String,
    },
    session: {
      type: String,
      required: true,
      default: '2025-26',
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
      default: 'A',
    },
    subjects: [subjectScoreSchema],
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
    grade: {
      type: String,
      required: true,
      default: 'F',
    },
    resultStatus: {
      type: String,
      required: true,
      enum: ['PASS', 'FAIL'],
      default: 'PASS',
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    teacherRemark: { type: String, default: '' },
    aiSuggestions: [{ type: String }],
    attendance: {
      totalWorkingDays: { type: Number, default: 200 },
      daysPresent: { type: Number, default: 185 },
      attendancePercentage: { type: Number, default: 92.5 },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);
export default Result;
