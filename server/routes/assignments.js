import express from 'express';
import { body, validationResult } from 'express-validator';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import { requireInstructorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get assignments for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      course: req.params.courseId,
      isPublished: true 
    }).populate('instructor', 'firstName lastName');

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('instructor', 'firstName lastName')
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
});

// Create assignment
router.post('/', requireInstructorOrAdmin, [
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('course').isMongoId(),
  body('dueDate').isISO8601()
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
        message: 'Unauthorized to create assignment for this course'
      });
    }

    const assignment = new Assignment({
      ...req.body,
      instructor: req.session.userId
    });

    await assignment.save();

    // Add assignment to course
    await Course.findByIdAndUpdate(req.body.course, {
      $push: { assignments: assignment._id }
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
});

// Submit assignment
router.post('/:id/submit', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.session.userId
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already submitted'
      });
    }

    // Check due date
    if (new Date() > assignment.dueDate && !assignment.allowLateSubmissions) {
      return res.status(400).json({
        success: false,
        message: 'Assignment submission deadline has passed'
      });
    }

    const submission = {
      student: req.session.userId,
      textSubmission: req.body.textSubmission,
      files: req.body.files || []
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
});

// Grade assignment
router.post('/:id/grade', requireInstructorOrAdmin, async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.isGraded = true;
    submission.gradedAt = new Date();
    submission.gradedBy = req.session.userId;

    await assignment.save();

    // Send notification
    const io = req.app.get('io');
    io.to(`user_${studentId}`).emit('notification', {
      type: 'grade_posted',
      title: 'Assignment Graded',
      message: `Your assignment "${assignment.title}" has been graded`
    });

    res.json({
      success: true,
      message: 'Assignment graded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to grade assignment',
      error: error.message
    });
  }
});

export default router;