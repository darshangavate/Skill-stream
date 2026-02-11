import {
  getUserById,
  getActiveEnrollmentForUser,
  getPathForUserCourse,
  getAssetById
} from "../services/dataStore.js";

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ ok: false, message });
}

// Simple ETA: sum expectedTime of remaining unlocked/locked nodes from currentIndex
function computeEtaMinutes(path, getAsset) {
  if (!path || !Array.isArray(path.nodes)) return 0;

  const start = Math.max(0, path.currentIndex || 0);
  let total = 0;

  for (let i = start; i < path.nodes.length; i++) {
    const node = path.nodes[i];
    if (!node || node.status === "done" || node.status === "skipped") continue;

    const asset = getAsset(node.assetId);
    total += asset?.expectedTimeMin || 0;
  }

  return total;
}

export const getDashboard = (req, res) => {
  const { userId } = req.params;

  const user = getUserById(userId);
  if (!user) return fail(res, `User not found: ${userId}`, 404);

  const enrollment = getActiveEnrollmentForUser(userId);
  if (!enrollment) {
    return fail(res, `No active enrollment for user: ${userId}`, 404);
  }

  const path = getPathForUserCourse(userId, enrollment.courseId);
  if (!path) {
    return fail(res, `Path not found for user ${userId} and course ${enrollment.courseId}`, 404);
  }

  const nextAsset = path.nextAssetId ? getAssetById(path.nextAssetId) : null;

  const etaMinutes = computeEtaMinutes(path, getAssetById);

  const dashboard = {
    user: {
      userId: user.userId,
      name: user.name,
      role: user.role,
      learning_style_preference: user.learning_style_preference,
      format_stats: user.format_stats || {},
      mastery_map: user.mastery_map || {}
    },
    enrollment,
    path,
    nextAsset,
    etaMinutes,
    alerts: [] // later we’ll fill with format pivot / struggling messages
  };

  return ok(res, dashboard);
};
