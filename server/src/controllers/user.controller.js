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
async function computeEtaMinutes(path, getAssetFunc) {
  if (!path || !Array.isArray(path.nodes)) return 0;

  const start = Math.max(0, path.currentIndex || 0);
  let total = 0;

  for (let i = start; i < path.nodes.length; i++) {
    const node = path.nodes[i];
    if (!node || node.status === "done" || node.status === "skipped") continue;

    const asset = await getAssetFunc(node.assetId);
    total += asset?.expectedTimeMin || 0;
  }

  return total;
}

export const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUserById(userId);
  if (!user) return fail(res, `User not found: ${userId}`, 404);

    const enrollment = await getActiveEnrollmentForUser(userId);
    if (!enrollment) {
      return fail(res, `No active enrollment for user: ${userId}`, 404);
    }

    const path = await getPathForUserCourse(userId, enrollment.courseId);
  if (!path) {
    return fail(res, `Path not found for user ${userId} and course ${enrollment.courseId}`, 404);
  }

    const nextAsset = path.nextAssetId ? await getAssetById(path.nextAssetId) : null;

    const etaMinutes = await computeEtaMinutes(path, getAssetById);

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
      alerts: []
    };

    return ok(res, dashboard);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};
