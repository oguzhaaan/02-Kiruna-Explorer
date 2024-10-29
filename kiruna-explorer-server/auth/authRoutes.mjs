import { Router } from "express";
import passport from "./passportConfig.mjs";
import { isLoggedIn } from "./authMiddleware.mjs"; // Adjusted import path

const router = Router();

// POST /api/sessions
router.post("/api/sessions", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).send(info);
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
router.get("/api/sessions/current", isLoggedIn, (req, res) => {
  res.json(req.user);
});

// DELETE /api/sessions/current
router.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

export default router;
