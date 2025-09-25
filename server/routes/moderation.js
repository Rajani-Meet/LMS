import express from 'express';
import { requireRole } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Mock moderation data for now
const mockReports = [
  {
    _id: '1',
    type: 'inappropriate_content',
    title: 'Inappropriate Content Report',
    description: 'User reported inappropriate content in course materials',
    reporter: { name: 'John Doe', email: 'john@example.com' },
    content: 'This content contains inappropriate material that violates community guidelines.',
    status: 'pending',
    createdAt: new Date()
  },
  {
    _id: '2',
    type: 'spam',
    title: 'Spam Report',
    description: 'Multiple spam messages in discussion forum',
    reporter: { name: 'Jane Smith', email: 'jane@example.com' },
    content: 'User is posting spam messages repeatedly in the forum.',
    status: 'approved',
    createdAt: new Date()
  }
];

// Get reports
router.get('/reports', requireRole(['admin']), [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'resolved', 'all'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    let filteredReports = mockReports;
    if (req.query.status && req.query.status !== 'all') {
      filteredReports = mockReports.filter(report => report.status === req.query.status);
    }

    res.json({ reports: filteredReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle report
router.post('/reports/:id/handle', requireRole(['admin']), [
  param('id').notEmpty().withMessage('Report ID is required'),
  body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const reportIndex = mockReports.findIndex(r => r._id === req.params.id);
    if (reportIndex === -1) {
      return res.status(404).json({ message: 'Report not found' });
    }

    mockReports[reportIndex].status = req.body.action === 'approve' ? 'approved' : 'rejected';
    mockReports[reportIndex].handledAt = new Date();
    mockReports[reportIndex].handledBy = req.user.id;
    mockReports[reportIndex].reason = req.body.reason;

    res.json({ message: 'Report handled successfully', report: mockReports[reportIndex] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;