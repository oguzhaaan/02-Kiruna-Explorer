import passport from "passport";
import LocalStrategy from "passport-local";
import UserDAO from "../dao/UserDAO.mjs";

const userDAO = new UserDAO();

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    const user = await userDAO.getUser(username, password);
    if (!user)
      return cb(null, false, { message: "Incorrect username or password." });
    return cb(null, user);
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  return cb(null, user);
});

export default passport;
