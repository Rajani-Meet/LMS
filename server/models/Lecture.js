import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
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
  videoUrl: {
    type: String
  },
  materials: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  duration: {
    type: Number // in minutes
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  transcript: {
    text: String,
    language: String,
    segments: [{
      start: Number,
      end: Number,
      text: String,
      timestamp_formatted: String
    }],
    timestamps: [{
      time: Number,
      text: String,
      formatted_time: String
    }],
    duration: Number,
    confidence: Number,
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  aiSummary: {
    title: String,
    keyPoints: [String],
    mainTopics: [{
      topic: String,
      description: String,
      timestamp: Number
    }],
    studyTime: String,
    difficulty: String,
    prerequisites: [String],
    nextSteps: [String],
    generatedAt: {
      type: Date,
      default: Date.now
    },
    aiGenerated: Boolean
  },
  audioFile: String,
  transcriptionStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  transcript: {
    text: String,
    timestamps: [{
      time: Number,
      text: String
    }],
    confidence: Number,
    language: String,
    duration: Number,
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  aiSummary: {
    title: String,
    keyPoints: [String],
    mainTopics: [{
      topic: String,
      description: String,
      timestamp: Number
    }],
    studyTime: String,
    difficulty: String,
    prerequisites: [String],
    nextSteps: [String],
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

lectureSchema.index({ course: 1, order: 1 });

export default mongoose.model('Lecture', lectureSchema);