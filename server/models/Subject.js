import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectId: {
      type: String,
      required: true,
      unique: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    class: {
      type: String,
      required: true,
      default: 'Class 10',
    },
    maximumMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passMarks: {
      type: Number,
      required: true,
      default: 33,
    },
    category: {
      type: String,
      enum: ['Core', 'Science', 'Mathematics', 'Languages', 'Social Sciences', 'Elective'],
      default: 'Core',
    }
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;
