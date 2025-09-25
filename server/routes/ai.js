import express from 'express';
import Lecture from '../models/Lecture.js';
import { authenticateSession } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';
import { transcribeAudio, generateSummary, generateChatResponse, extractAudioFromVideo, smartSearchTranscript } from '../utils/whisperService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'audio');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'video/mp4', 'video/avi', 'video/mov'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Generate transcript using Whisper AI
router.post('/transcript/:lectureId', upload.single('audio'), [
  param('lectureId').isMongoId().withMessage('Invalid lecture ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Update status to processing
    lecture.transcriptionStatus = 'processing';
    await lecture.save();

    let audioFilePath;

    if (req.file) {
      // New audio file uploaded
      audioFilePath = req.file.path;
      lecture.audioFile = audioFilePath;
    } else if (lecture.videoUrl) {
      // Extract audio from existing video
      try {
        audioFilePath = await extractAudioFromVideo(lecture.videoUrl);
      } catch (error) {
        lecture.transcriptionStatus = 'failed';
        await lecture.save();
        return res.status(400).json({ message: 'Failed to extract audio from video', error: error.message });
      }
    } else {
      lecture.transcriptionStatus = 'failed';
      await lecture.save();
      return res.status(400).json({ message: 'No audio file or video URL provided' });
    }

    try {
      // Generate transcript using Whisper
      const transcript = await transcribeAudio(audioFilePath);
      
      // Update lecture with transcript
      lecture.transcript = transcript;
      lecture.transcriptionStatus = 'completed';
      await lecture.save();

      // Clean up temporary audio file if it was extracted from video
      if (!req.file && audioFilePath) {
        fs.unlink(audioFilePath, (err) => {
          if (err) console.error('Failed to delete temporary audio file:', err);
        });
      }

      res.json({ 
        message: 'Transcript generated successfully',
        transcript: transcript
      });

    } catch (error) {
      lecture.transcriptionStatus = 'failed';
      await lecture.save();
      
      console.error('Transcription error:', error);
      res.status(500).json({ 
        message: 'Failed to generate transcript', 
        error: error.message 
      });
    }

  } catch (error) {
    console.error('Transcript route error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate AI summary from transcript
router.post('/summary/:lectureId', [
  param('lectureId').isMongoId().withMessage('Invalid lecture ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (!lecture.transcript || !lecture.transcript.text) {
      return res.status(400).json({ message: 'No transcript available. Please generate transcript first.' });
    }

    try {
      // Generate AI summary
      const summary = await generateSummary(lecture.transcript.text);
      
      // Update lecture with summary
      lecture.aiSummary = summary;
      await lecture.save();

      res.json({ 
        message: 'AI summary generated successfully',
        summary: summary
      });

    } catch (error) {
      console.error('Summary generation error:', error);
      res.status(500).json({ 
        message: 'Failed to generate AI summary', 
        error: error.message 
      });
    }

  } catch (error) {
    console.error('Summary route error:', error);
    res.status(500).json({ message: error.message });
  }
});

// AI Chat based on transcript
router.post('/chat/:lectureId', [
  param('lectureId').isMongoId().withMessage('Invalid lecture ID'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('chatHistory').optional().isArray().withMessage('Chat history must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (!lecture.transcript || !lecture.transcript.text) {
      return res.status(400).json({ message: 'No transcript available. Please generate transcript first.' });
    }

    try {
      const chatHistory = req.body.chatHistory || [];
      
      // Generate AI chat response
      const response = await generateChatResponse(
        lecture.transcript.text, 
        req.body.message, 
        chatHistory
      );

      res.json({ 
        message: 'Chat response generated successfully',
        response: response
      });

    } catch (error) {
      console.error('Chat response error:', error);
      res.status(500).json({ 
        message: 'Failed to generate chat response', 
        error: error.message 
      });
    }

  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Smart search in transcript
router.post('/search/:lectureId', [
  param('lectureId').isMongoId().withMessage('Invalid lecture ID'),
  body('query').trim().isLength({ min: 1 }).withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (!lecture.transcript || !lecture.transcript.text) {
      return res.status(400).json({ message: 'No transcript available. Please generate transcript first.' });
    }

    try {
      // Perform smart search
      const searchResults = await smartSearchTranscript(lecture.transcript.text, req.body.query);

      res.json({ 
        message: 'Search completed successfully',
        ...searchResults
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ 
        message: 'Failed to search transcript', 
        error: error.message 
      });
    }

  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get transcript status
router.get('/transcript/:lectureId/status', [
  param('lectureId').isMongoId().withMessage('Invalid lecture ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.lectureId).select('transcriptionStatus transcript aiSummary');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json({
      transcriptionStatus: lecture.transcriptionStatus,
      hasTranscript: !!(lecture.transcript && lecture.transcript.text),
      hasSummary: !!(lecture.aiSummary && lecture.aiSummary.title),
      transcriptLength: lecture.transcript?.text?.length || 0,
      language: lecture.transcript?.language || null
    });

  } catch (error) {
    console.error('Status route error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;