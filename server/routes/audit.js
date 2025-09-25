import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { requireRole } from '../middleware/auth.js';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Get audit logs (admin only)
router.get('/', requireRole(['admin']), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('action').optional().isIn(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ENROLL', 'SUBMIT', 'GRADE']),
  query('resource').optional().isIn(['USER', 'COURSE', 'LECTURE', 'ASSIGNMENT', 'QUIZ', 'NOTIFICATION']),
  query('userId').optional().isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resource) filter.resource = req.query.resource;
    if (req.query.userId) filter.user = req.query.userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create audit log entry
export const createAuditLog = async (userId, action, resource, resourceId = null, details = {}, req = null) => {
  try {
    const auditLog = new AuditLog({
      user: userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent')
    });

    await auditLog.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export default router;