// --- Imports ---
import express from "express";
import morgan from "morgan";
import cors from "cors";

import passport from "passport";
import session from "express-session";

import authRoutes from "./auth/authRoutes.mjs";

// --- Middlewares ---
const app = express();
app.use(morgan("dev"));
app.use(express.json());

// --- Session Configuration ---
app.use(
  session({
    secret: "Sic.Parvis.Magna", // Famous quote from Uncharted video game
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));

// --- CORS ---
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// --- Server Activation ---
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/`)
);

// --- Routes ---
app.use(authRoutes);

export { app };
