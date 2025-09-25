import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { requireAdmin, requireInstructorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', requireInstructorOrAdmin, async (req, res) => {
  try {
    const userRole = req.session.userRole;
    const userId = req.session.userId;

    let stats = {};

    if (userRole === 'admin') {
      // Admin dashboard stats
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalInstructors = await User.countDocuments({ role: 'instructor' });
      const totalCourses = await Course.countDocuments();
      const activeCourses = await Course.countDocuments({ isPublished: true });
      const totalAssignments = await Assignment.countDocuments();
      const totalQuizzes = await Quiz.countDocuments();

      stats = {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        activeCourses,
        totalAssignments,
        totalQuizzes
      };
    } else if (userRole === 'instructor') {
      // Instructor dashboard stats
      const myCourses = await Course.find({ instructor: userId });
      const totalStudents = myCourses.reduce((sum, course) => 
        sum + course.enrolledStudents.length, 0);
      
      const totalAssignments = await Assignment.countDocuments({ 
        instructor: userId 
      });
      
      const totalQuizzes = await Quiz.countDocuments({ 
        instructor: userId 
      });

      stats = {
        myCourses: myCourses.length,
        totalStudents,
        totalAssignments,
        totalQuizzes
      };
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// Export users to CSV (admin only)
router.get('/export/users/csv', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const fields = ['firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
});

// Export users to Excel (admin only)
router.get('/export/users/excel', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Active', key: 'isActive', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    users.forEach(user => {
      worksheet.addRow({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive ? 'Yes' : 'No',
        createdAt: user.createdAt.toISOString().split('T')[0]
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
});

// Course analytics
router.get('/course/:courseId', requireInstructorOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('enrolledStudents.student', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if instructor owns the course or is admin
    if (course.instructor.toString() !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const analytics = {
      totalEnrollments: course.enrolledStudents.length,
      avgProgress: course.enrolledStudents.reduce((sum, enrollment) => 
        sum + enrollment.progress, 0) / course.enrolledStudents.length || 0,
      enrollmentsByMonth: {}, // Could implement monthly enrollment tracking
      completionRate: course.enrolledStudents.filter(
        enrollment => enrollment.progress >= 100).length / course.enrolledStudents.length * 100 || 0
    };

    res.json({
      success: true,
      analytics,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics',
      error: error.message
    });
  }
});

export default router;