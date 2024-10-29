import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import userDAO from "./dao/UserDAO.mjs";

// --- Setting Up Passport Local Strategy ---
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const user = await userDAO.getUser(username, password);
    if (!user) return cb(null, false, "Incorrect username or password.");
    return cb(null, user);
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

// --- Middleware for Checking If User is Logged In ---
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

const sessionMiddleware = session({
  secret: "Sic.Parvis.Magna",
  resave: false,
  saveUninitialized: false,
});

function initializeAuth(app) {
  app.use(sessionMiddleware);
  app.use(passport.authenticate("session"));
}

export { initializeAuth, isLoggedIn };
