import express from 'express';
import Lecture from '../models/Lecture.js';
import Course from '../models/Course.js';
import { authenticateSession, requireRole } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Get lectures by course
router.get('/course/:courseId', [
  param('courseId').isMongoId().withMessage('Invalid course ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lectures = await Lecture.find({ 
      course: req.params.courseId,
      isPublished: true 
    })
    .populate('instructor', 'name email')
    .sort({ order: 1 });

    res.json({ lectures });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lecture
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid lecture ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('course', 'title');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json({ lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create lecture (instructor/admin only)
router.post('/', requireRole(['instructor', 'admin']), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('videoUrl').optional().isURL().withMessage('Invalid video URL'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor of the course or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create lectures for this course' });
    }

    const lecture = new Lecture({
      ...req.body,
      instructor: req.user.id
    });

    await lecture.save();
    await lecture.populate('instructor', 'name email');

    res.status(201).json({ lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lecture
router.put('/:id', requireRole(['instructor', 'admin']), [
  param('id').isMongoId().withMessage('Invalid lecture ID'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('videoUrl').optional().isURL().withMessage('Invalid video URL'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && lecture.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this lecture' });
    }

    Object.assign(lecture, req.body);
    await lecture.save();
    await lecture.populate('instructor', 'name email');

    res.json({ lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lecture
router.delete('/:id', requireRole(['instructor', 'admin']), [
  param('id').isMongoId().withMessage('Invalid lecture ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && lecture.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this lecture' });
    }

    await Lecture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;