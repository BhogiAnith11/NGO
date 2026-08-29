/**
 * requireRole(...roles) — returns middleware that checks req.user.role
 * Usage: router.get('/admin/ngos', protect, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. Required role: ${roles.join(' or ')}`
      );
    }
    next();
  };
};

module.exports = { requireRole };
