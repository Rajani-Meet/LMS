import express from 'express';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import { authenticateSession, requireRole } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Get submissions by assignment (instructor/admin only)
router.get('/assignment/:assignmentId', requireRole(['instructor', 'admin']), [
  param('assignmentId').isMongoId().withMessage('Invalid assignment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's submissions
router.get('/my', async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate('assignment', 'title dueDate maxPoints')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment
router.post('/', [
  body('assignment').isMongoId().withMessage('Valid assignment ID is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const assignment = await Assignment.findById(req.body.assignment);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: req.body.assignment,
      student: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Check due date
    if (new Date() > assignment.dueDate) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    const submission = new Submission({
      assignment: req.body.assignment,
      student: req.user.id,
      content: req.body.content,
      attachments: req.body.attachments || []
    });

    await submission.save();
    await submission.populate('assignment', 'title dueDate maxPoints');

    res.status(201).json({ submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade submission (instructor/admin only)
router.post('/:id/grade', requireRole(['instructor', 'admin']), [
  param('id').isMongoId().withMessage('Invalid submission ID'),
  body('grade').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;
    submission.status = 'GRADED';

    await submission.save();
    await submission.populate('student', 'name email');
    await submission.populate('gradedBy', 'name email');

    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;