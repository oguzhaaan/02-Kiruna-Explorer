import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//The environment variable is set in the package.json file in the test script.
let env = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : "development"

// Construct the path to the database file
const dbPath = env === "test" ? path.resolve(__dirname, "database_test.db") : path.resolve(__dirname, "database.db");

// Log the database path to verify
console.log("Using database at:", dbPath);

// Create and export the database instance
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

export default db;
