import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      default: 'A',
    },
    session: {
      type: String,
      required: [true, 'Academic session is required'],
      default: '2025-26',
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default Student;
