import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
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
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      required: true
    },
    options: [String], // For multiple choice
    correctAnswer: String,
    points: {
      type: Number,
      default: 1
    },
    explanation: String
  }],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  attemptLimit: {
    type: Number,
    default: 1
  },
  dueDate: Date,
  isPublished: {
    type: Boolean,
    default: false
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: String,
    enum: ['immediately', 'after-due-date', 'never'],
    default: 'immediately'
  },
  attempts: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: Date,
    answers: [{
      questionIndex: Number,
      answer: String,
      isCorrect: Boolean,
      points: Number
    }],
    score: Number,
    totalPoints: Number,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);