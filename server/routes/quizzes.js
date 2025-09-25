import express from 'express';
import { body, validationResult } from 'express-validator';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import { requireInstructorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get quizzes for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      course: req.params.courseId,
      isPublished: true 
    }).populate('instructor', 'firstName lastName');

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('instructor', 'firstName lastName')
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // For students, hide correct answers
    if (req.session.userRole === 'student') {
      quiz.questions = quiz.questions.map(q => ({
        ...q.toObject(),
        correctAnswer: undefined,
        explanation: undefined
      }));
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
});

// Create quiz
router.post('/', requireInstructorOrAdmin, [
  body('title').notEmpty().trim(),
  body('course').isMongoId(),
  body('questions').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify instructor owns the course or is admin
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create quiz for this course'
      });
    }

    const quiz = new Quiz({
      ...req.body,
      instructor: req.session.userId
    });

    await quiz.save();

    // Add quiz to course
    await Course.findByIdAndUpdate(req.body.course, {
      $push: { quizzes: quiz._id }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
});

// Start quiz attempt
router.post('/:id/start', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check attempt limit
    const userAttempts = quiz.attempts.filter(
      attempt => attempt.student.toString() === req.session.userId
    );

    if (userAttempts.length >= quiz.attemptLimit) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    // Check if there's an active attempt
    const activeAttempt = userAttempts.find(attempt => !attempt.isCompleted);
    if (activeAttempt) {
      return res.json({
        success: true,
        attempt: activeAttempt
      });
    }

    // Create new attempt
    const attempt = {
      student: req.session.userId,
      answers: []
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    const newAttempt = quiz.attempts[quiz.attempts.length - 1];

    res.json({
      success: true,
      message: 'Quiz attempt started',
      attempt: newAttempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz',
      error: error.message
    });
  }
});

// Submit quiz attempt
router.post('/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Find active attempt
    const attempt = quiz.attempts.find(
      att => att.student.toString() === req.session.userId && !att.isCompleted
    );

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: 'No active attempt found'
      });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      if (question) {
        totalPoints += question.points;
        const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
        
        attempt.answers.push({
          questionIndex: index,
          answer: answer,
          isCorrect: isCorrect,
          points: isCorrect ? question.points : 0
        });

        if (isCorrect) {
          earnedPoints += question.points;
        }
      }
    });

    attempt.score = earnedPoints;
    attempt.totalPoints = totalPoints;
    attempt.submittedAt = new Date();
    attempt.isCompleted = true;

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        score: earnedPoints,
        totalPoints: totalPoints,
        percentage: Math.round((earnedPoints / totalPoints) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

export default router;