import {
  getQuestions,
  getAttempts,
  getUserById,
  getAssetById,
  getPathForUserCourse,
  getActiveEnrollmentForUser
} from "../services/dataStore.js";

import {
  pickQuizQuestions,
  calculateScore
} from "../services/quiz.service.js";

import {
  updateUserStatsAndPath
} from "../services/engine.service.js";

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ ok: false, message });
}

// GET QUIZ
export const getQuiz = (req, res) => {
  const { userId } = req.params;
  const { topic, mode = "normal" } = req.query;

  const user = getUserById(userId);
  if (!user) return fail(res, "User not found", 404);

  const questions = pickQuizQuestions(userId, topic, mode);
  return ok(res, { questions });
};

// SUBMIT QUIZ
export const submitQuiz = (req, res) => {
  const { userId } = req.params;
  const {
    courseId,
    assetId,
    topic,
    timeSpentMin,
    answers
  } = req.body;

  const asset = getAssetById(assetId);

if (!asset) {
  return res.status(400).json({
    ok: false,
    message: `Invalid asset. Received assetId="${assetId}". Make sure you POST JSON with key "assetId" and Content-Type: application/json.`,
    receivedBody: req.body
  });
}


  const { score, wrongQuestionIds } = calculateScore(topic, answers);

  const enrollment = getActiveEnrollmentForUser(userId);
  const path = getPathForUserCourse(userId, enrollment.courseId);

  const result = updateUserStatsAndPath({
    userId,
    courseId,
    path,
    asset,
    topic,
    score,
    wrongQuestionIds,
    timeSpentMin
  });
  console.log("HEADERS:", req.headers["content-type"]);
  console.log("BODY:", req.body);

  return ok(res, {
    score,
    wrongQuestionIds,
    nextAssetId: result.nextAssetId,
    reason: result.reason,
    updatedPath: result.updatedPath
  });
};
