import { createAuditLog } from '../routes/audit.js';

// Middleware to automatically log certain actions
export const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const resourceId = req.params.id || req.body.id || null;
        const details = {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined
        };
        
        // Don't await to avoid blocking the response
        createAuditLog(req.user.id, action, resource, resourceId, details, req)
          .catch(err => console.error('Audit logging failed:', err));
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Manual audit logging function
export const logAudit = async (req, action, resource, resourceId = null, details = {}) => {
  if (req.user) {
    await createAuditLog(req.user.id, action, resource, resourceId, details, req);
  }
};