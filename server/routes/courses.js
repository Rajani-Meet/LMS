import express from 'express';
import { body, validationResult } from 'express-validator';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { requireInstructorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { search, category, difficulty, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName avatar email')
      .populate('assignments')
      .populate('quizzes');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
});

// Create course
router.post('/', requireInstructorOrAdmin, [
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('category').notEmpty(),
  body('duration').isNumeric()
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

    const courseData = {
      ...req.body,
      instructor: req.session.userId
    };

    const course = new Course(courseData);
    await course.save();

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.session.userId, {
      $push: { createdCourses: course._id }
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: populatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// Update course
router.put('/:id', requireInstructorOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
});

// Delete course
router.delete('/:id', requireInstructorOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this course'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
});

// Enroll in course
router.post('/:id/enroll', async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.session.userId;

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not published'
      });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === userId
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check enrollment limit
    if (course.enrollmentLimit && course.enrolledStudents.length >= course.enrollmentLimit) {
      return res.status(400).json({
        success: false,
        message: 'Course enrollment limit reached'
      });
    }

    // Enroll student
    course.enrolledStudents.push({ student: userId });
    await course.save();

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId }
    });

    // Send notification
    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('notification', {
      type: 'course_enrollment',
      title: 'Enrollment Successful',
      message: `You have successfully enrolled in ${course.title}`
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
});

// Get my courses (enrolled or created)
router.get('/my/courses', async (req, res) => {
  try {
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    let courses = [];

    if (userRole === 'student') {
      // Get enrolled courses
      courses = await Course.find({
        'enrolledStudents.student': userId
      }).populate('instructor', 'firstName lastName avatar');
    } else if (userRole === 'instructor') {
      // Get created courses
      courses = await Course.find({
        instructor: userId
      });
    } else if (userRole === 'admin') {
      // Get all courses
      courses = await Course.find({})
        .populate('instructor', 'firstName lastName avatar');
    }

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

export default router;