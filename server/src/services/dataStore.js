import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(fileName) {
  const filePath = path.join(__dirname, "..", "data", fileName);

  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${fileName}: ${err.message}`);
  }
}

// In-memory cache
let assets = [];
let courses = [];
let users = [];
let enrollments = [];
let paths = [];
let questions = [];
let attempts = [];

function loadAll() {
  assets = readJson("assets.json");
  courses = readJson("courses.json");
  users = readJson("users.json");
  enrollments = readJson("enrollments.json");
  paths = readJson("paths.json");
  questions = readJson("questions.json");
  attempts = readJson("attempts.json");
}

loadAll();

// ---- getters ----
export const getAssets = () => assets;
export const getCourses = () => courses;
export const getUsers = () => users;
export const getEnrollments = () => enrollments;
export const getPaths = () => paths;

export const getAssetById = (assetId) => assets.find((a) => a.assetId === assetId);
export const getCourseById = (courseId) => courses.find((c) => c.courseId === courseId);
export const getUserById = (userId) => users.find((u) => u.userId === userId);

export const getActiveEnrollmentForUser = (userId) =>
  enrollments.find((e) => e.userId === userId && e.status === "active");

export const getPathForUserCourse = (userId, courseId) =>
  paths.find((p) => p.userId === userId && p.courseId === courseId);

// Optional exports for later (engine/quiz)
export const getQuestions = () => questions;
export const getAttempts = () => attempts;

// reload (useful when editing JSON during dev)
export const reload = () => loadAll();
