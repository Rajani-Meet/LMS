import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  attachments: [String],
  instructions: String,
  rubric: [{
    criteria: String,
    points: Number,
    description: String
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    files: [String],
    textSubmission: String,
    grade: {
      type: Number,
      min: 0
    },
    feedback: String,
    isGraded: {
      type: Boolean,
      default: false
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  allowLateSubmissions: {
    type: Boolean,
    default: true
  },
  latePenalty: {
    type: Number,
    default: 0 // percentage per day
  }
}, {
  timestamps: true
});

export default mongoose.model('Assignment', assignmentSchema);