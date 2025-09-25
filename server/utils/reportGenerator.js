import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

export const generateUsersCSV = async () => {
  const users = await User.find({}, 'name email role isActive createdAt').lean();
  
  const fields = [
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Role', value: 'role' },
    { label: 'Status', value: 'isActive' },
    { label: 'Created At', value: 'createdAt' }
  ];

  const parser = new Parser({ fields });
  return parser.parse(users);
};

export const generateUsersExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Status', key: 'isActive', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  const users = await User.find({}, 'name email role isActive createdAt').lean();
  
  users.forEach(user => {
    worksheet.addRow({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive ? 'Active' : 'Inactive',
      createdAt: user.createdAt.toISOString().split('T')[0]
    });
  });

  return workbook;
};

export const generateCourseReport = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .populate('students', 'name email');

  const assignments = await Assignment.find({ course: courseId });
  const submissions = await Submission.find({ 
    assignment: { $in: assignments.map(a => a._id) } 
  }).populate('student', 'name email');

  const workbook = new ExcelJS.Workbook();
  
  // Course Info Sheet
  const courseSheet = workbook.addWorksheet('Course Info');
  courseSheet.addRow(['Course Title', course.title]);
  courseSheet.addRow(['Description', course.description]);
  courseSheet.addRow(['Instructor', course.instructor.name]);
  courseSheet.addRow(['Students Enrolled', course.students.length]);
  courseSheet.addRow(['Created At', course.createdAt.toISOString().split('T')[0]]);

  // Students Sheet
  const studentsSheet = workbook.addWorksheet('Students');
  studentsSheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Enrolled At', key: 'enrolledAt', width: 20 }
  ];

  course.students.forEach(student => {
    studentsSheet.addRow({
      name: student.name,
      email: student.email,
      enrolledAt: new Date().toISOString().split('T')[0]
    });
  });

  // Assignments Sheet
  const assignmentsSheet = workbook.addWorksheet('Assignments');
  assignmentsSheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Max Points', key: 'maxPoints', width: 15 },
    { header: 'Submissions', key: 'submissions', width: 15 }
  ];

  assignments.forEach(assignment => {
    const assignmentSubmissions = submissions.filter(s => 
      s.assignment.toString() === assignment._id.toString()
    );
    
    assignmentsSheet.addRow({
      title: assignment.title,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      maxPoints: assignment.maxPoints,
      submissions: assignmentSubmissions.length
    });
  });

  return workbook;
};