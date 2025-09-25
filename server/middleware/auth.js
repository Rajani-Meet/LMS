export const authenticateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.userRole || !roles.includes(req.session.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireInstructor = requireRole(['instructor', 'admin']);
export const requireInstructorOrAdmin = requireRole(['instructor', 'admin']);