import {
  getUserById,
  getActiveEnrollmentForUser,
  getPathForUserCourse,
  getAssetById,
} from "../services/dataStore.js";

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ ok: false, message });
}

// status helpers (support old + new)
const isCompleted = (s) => s === "completed" || s === "done";
const isSkipped = (s) => s === "skipped";

// Simple ETA: sum expectedTimeMin of remaining (not completed/skipped) nodes from currentIndex
async function computeEtaMinutes(path) {
  if (!path || !Array.isArray(path.nodes)) return 0;

  const start = Math.max(0, Number(path.currentIndex || 0));
  let total = 0;

  for (let i = start; i < path.nodes.length; i++) {
    const node = path.nodes[i];
    if (!node) continue;

    // ✅ works for both old & new (locked/unlocked are NOT completed, so counted)
    if (isCompleted(node.status) || isSkipped(node.status)) continue;

    const asset = await getAssetById(node.assetId);
    total += asset?.expectedTimeMin || 0;
  }

  return total;
}

// Progress helper
function computeProgress(path) {
  const total = path?.nodes?.length || 0;
  const completed = (path?.nodes || []).filter((n) => isCompleted(n.status)).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}

// ✅ GET DASHBOARD
export const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUserById(userId);
    if (!user) return fail(res, `User not found: ${userId}`, 404);

    const enrollment = await getActiveEnrollmentForUser(userId);
    if (!enrollment) return fail(res, `No active enrollment for user: ${userId}`, 404);

    const path = await getPathForUserCourse(userId, enrollment.courseId);
    if (!path) {
      return fail(res, `Path not found for user ${userId} and course ${enrollment.courseId}`, 404);
    }

    const nextAsset = path.nextAssetId ? await getAssetById(path.nextAssetId) : null;
    const etaMinutes = await computeEtaMinutes(path);
    const progress = computeProgress(path);

    // Convert mastery_map (Mongoose Map) to plain object for frontend
    const masteryObj =
      user.mastery_map && typeof user.mastery_map.entries === "function"
        ? Object.fromEntries(user.mastery_map.entries())
        : user.mastery_map || {};

    const dashboard = {
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
        learning_style_preference: user.learning_style_preference,
        format_stats: user.format_stats || {},
        mastery_map: masteryObj,
      },
      enrollment,
      path,
      nextAsset,
      etaMinutes,
      progress,
      alerts: [],
    };

    return ok(res, dashboard);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};


// GET ALL USERS (for admin/demo)
export const getAllUsers = async (req, res) => {
  try {
    const users = await (await import("../models/User.js")).default
      .find()
      .select("userId name role learning_style_preference");

    return ok(res, users);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};
