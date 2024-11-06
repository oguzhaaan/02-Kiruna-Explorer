export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden" });
  };
};
