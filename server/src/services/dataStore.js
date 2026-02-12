import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Asset from "../models/Asset.js";
import Path from "../models/Path.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";

// ---- getters ----
export const getAssets = async () => await Asset.find();
export const getCourses = async () => await Course.find();
export const getUsers = async () => await User.find();
export const getEnrollments = async () => await Enrollment.find();
export const getPaths = async () => await Path.find();

export const getAssetById = async (assetId) => await Asset.findOne({ assetId });
export const getCourseById = async (courseId) => await Course.findOne({ courseId });
export const getUserById = async (userId) => await User.findOne({ userId });

export const getActiveEnrollmentForUser = async (userId) =>
  await Enrollment.findOne({ userId, status: "active" });

export const getPathForUserCourse = async (userId, courseId) =>
  await Path.findOne({ userId, courseId });

export const getQuestions = async () => await Question.find();
export const getAttempts = async () => await Attempt.find();

export const getQuestionsByTopic = async (topic) =>
  await Question.find({ topic });

export const getAttemptsByUser = async (userId) =>
  await Attempt.find({ userId });
