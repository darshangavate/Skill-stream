import User from "../models/User.js";
import Path from "../models/Path.js";
import Asset from "../models/Asset.js";
import Attempt from "../models/Attempt.js";

// ---------- helpers ----------
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function normalizeFormatKey(format) {
  const f = (format || "").toLowerCase();
  if (f.includes("video")) return "video";
  if (f.includes("doc")) return "doc";
  if (f.includes("info")) return "infographic";
  if (f.includes("lab")) return "lab";
  return "doc";
}

function getPreferredFormat(user) {
  const entries = Object.entries(user.format_stats || {});
  const withEnough = entries.filter(([_, v]) => (v?.attempts || 0) >= 2);
  const pool = withEnough.length ? withEnough : entries;

  pool.sort((a, b) => (b[1]?.avgScore || 0) - (a[1]?.avgScore || 0));
  return pool[0]?.[0] || "doc";
}

async function computeAvgTimeRatio(userId) {
  const attempts = await Attempt.find({ userId }).sort({ createdAt: -1 }).limit(10);

  const ratios = attempts
    .map((a) => Number(a.timeRatio))
    .filter((x) => Number.isFinite(x) && x > 0);

  if (!ratios.length) return 1;

  const avg = ratios.reduce((s, x) => s + x, 0) / ratios.length;
  return Math.max(0.7, Math.min(2.0, avg));
}

// status helpers (supports old seed + new engine)
const isCompleted = (s) => s === "completed" || s === "done";
const isSkipped = (s) => s === "skipped";
const isOldSeed = (s) => s === "unlocked" || s === "locked";

// Normalize path node statuses in-place (gradual migration)
function normalizePathStatuses(path) {
  if (!path?.nodes) return;

  for (const n of path.nodes) {
    if (!n) continue;

    // convert old seed to new standard
    if (n.status === "unlocked" || n.status === "locked") {
      n.status = "pending";
    }

    // if blank/null
    if (!n.status) n.status = "pending";
  }
}

async function computeBaseETA(path) {
  const idx = Number(path.currentIndex ?? 0);

  const remainingIds = (path.nodes || [])
    .slice(idx)
    .filter((n) => n && !isCompleted(n.status) && !isSkipped(n.status))
    .map((n) => n.assetId);

  if (!remainingIds.length) return 0;

  const assets = await Asset.find({ assetId: { $in: remainingIds } });
  const map = new Map(assets.map((a) => [a.assetId, a]));

  return remainingIds.reduce((acc, id) => acc + (map.get(id)?.expectedTimeMin || 10), 0);
}

function pickCandidate({ candidates, preferredFormat, excludeIds = [] }) {
  const exclude = new Set(excludeIds);

  const scored = candidates
    .filter((a) => a && !exclude.has(a.assetId))
    .map((a) => {
      const fmt = normalizeFormatKey(a.format);
      const fmtScore = fmt === preferredFormat ? 50 : 0;
      const diffScore = (10 - (a.difficulty || 1)) * 2; // easier → higher
      return { a, score: fmtScore + diffScore };
    })
    .sort((x, y) => y.score - x.score);

  return scored[0]?.a || null;
}

// ---------- MAIN ENGINE ----------
export async function updateUserStatsAndPath({
  userId,
  courseId,
  path,
  asset,
  topic,
  score,
  wrongQuestionIds = [],
  timeSpentMin,
  timeRatio,
}) {
  // 1) Load fresh user doc safely
  const user = await User.findOne({ userId });
  if (!user) throw new Error("User not found");

  // 2) Update format_stats safely
  const fmtKey = normalizeFormatKey(asset.format);
  if (!user.format_stats) user.format_stats = {};
  if (!user.format_stats[fmtKey]) user.format_stats[fmtKey] = { attempts: 0, avgScore: 0 };

  const stat = user.format_stats[fmtKey];
  const prevAttempts = stat.attempts || 0;
  const prevAvg = stat.avgScore || 0;

  const newAttempts = prevAttempts + 1;
  const newAvg = (prevAvg * prevAttempts + score) / newAttempts;

  stat.attempts = newAttempts;
  stat.avgScore = newAvg;

  // 3) Update mastery_map by topic
  if (!user.mastery_map) user.mastery_map = new Map();

  const oldM = Number(user.mastery_map.get(topic) ?? 0.5);

  const struggling = score < 50 || timeRatio > 1.8;
  const breezing = score >= 80 && timeRatio <= 1.2;

  let delta = 0;
  if (struggling) delta = -0.2;
  else if (breezing) delta = +0.15;
  else if (score >= 60) delta = +0.05;
  else delta = -0.05;

  user.mastery_map.set(topic, clamp01(oldM + delta));

  // 4) Determine preferred format
  const preferredFormat = getPreferredFormat(user);
  user.learning_style_preference = `${preferredFormat}_first`;

  await user.save();

  // 5) Load fresh path safely
  const freshPath = await Path.findOne({ pathId: path.pathId });
  if (!freshPath) throw new Error("Path not found");

  // ✅ normalize old seeded statuses -> pending (gradual migration)
  normalizePathStatuses(freshPath);

  // 6) Mark attempted asset completed
  const currentIndex = Number(freshPath.currentIndex ?? 0);

  let completedIdx = -1;
  if (freshPath.nodes?.[currentIndex]?.assetId === asset.assetId) {
    completedIdx = currentIndex;
  } else {
    completedIdx = (freshPath.nodes || []).findIndex((n) => n.assetId === asset.assetId);
  }

  if (completedIdx >= 0) {
    freshPath.nodes[completedIdx].status = "completed";
  }

  // ✅ advance currentIndex to first non-completed (skip completed/skipped)
  let nextIndex = 0;
  while (
    nextIndex < (freshPath.nodes?.length || 0) &&
    (isCompleted(freshPath.nodes[nextIndex]?.status) || isSkipped(freshPath.nodes[nextIndex]?.status))
  ) {
    nextIndex++;
  }
  freshPath.currentIndex = Math.min(nextIndex, (freshPath.nodes?.length || 0));

  // 7) Resequencing
  const allTopicAssets = await Asset.find({ topic });
  const alreadyInPath = new Set((freshPath.nodes || []).map((n) => n.assetId));
  const excludeIds = Array.from(alreadyInPath);

  let reason = "Continuing normal path.";
  let nextAssetId = null;

  if (struggling) {
    const easierCandidates = allTopicAssets.filter(
      (a) => (a.difficulty || 1) < (asset.difficulty || 1)
    );

    const reinforcement = pickCandidate({
      candidates: easierCandidates,
      preferredFormat,
      excludeIds,
    });

    if (reinforcement) {
      const insertAt = Math.min(freshPath.currentIndex + 1, freshPath.nodes.length);
      freshPath.nodes.splice(insertAt, 0, {
        assetId: reinforcement.assetId,
        status: "pending",
        addedBy: "engine",
      });

      reason = `Low performance in ${topic}. Added reinforcement (${preferredFormat}) before continuing.`;
      nextAssetId = reinforcement.assetId;
    } else {
      reason = `Low performance in ${topic}. Reinforcement not found, continuing.`;
    }
  } else if (breezing) {
    const harderCandidates = allTopicAssets.filter(
      (a) => (a.difficulty || 1) > (asset.difficulty || 1)
    );

    const advanced =
      harderCandidates
        .map((a) => ({
          a,
          score:
            (normalizeFormatKey(a.format) === preferredFormat ? 30 : 0) +
            (a.difficulty || 1) * 5,
        }))
        .sort((x, y) => y.score - x.score)[0]?.a || null;

    if (advanced) {
      const insertAt = Math.min(freshPath.currentIndex + 1, freshPath.nodes.length);
      freshPath.nodes.splice(insertAt, 0, {
        assetId: advanced.assetId,
        status: "pending",
        addedBy: "engine",
      });

      reason = `Strong performance in ${topic}. Fast-tracked to a harder module.`;
      nextAssetId = advanced.assetId;
    } else {
      reason = `Strong performance in ${topic}. Continuing normal path.`;
    }
  } else {
    const preferredCandidates = allTopicAssets.filter(
      (a) => normalizeFormatKey(a.format) === preferredFormat
    );

    const candidate = pickCandidate({
      candidates: preferredCandidates,
      preferredFormat,
      excludeIds,
    });

    if (candidate) {
      const insertAt = Math.min(freshPath.currentIndex + 1, freshPath.nodes.length);
      freshPath.nodes.splice(insertAt, 0, {
        assetId: candidate.assetId,
        status: "pending",
        addedBy: "engine",
      });

      reason = `Adjusted next module to your preferred format (${preferredFormat}) for ${topic}.`;
      nextAssetId = candidate.assetId;
    }
  }

  // ✅ determine nextAssetId = first node that is not completed/skipped
  if (!nextAssetId) {
    const nextNode = (freshPath.nodes || []).find(
      (n) => n && !isCompleted(n.status) && !isSkipped(n.status)
    );
    nextAssetId = nextNode?.assetId || null;
  }

  freshPath.nextAssetId = nextAssetId;
  freshPath.lastUpdatedReason = reason;

  // 8) ETA = remaining expected time * speed factor
  const baseEta = await computeBaseETA(freshPath);
  const speedFactor = await computeAvgTimeRatio(userId);
  freshPath.etaMinutes = Math.round(baseEta * speedFactor);

  freshPath.updatedAt = new Date();
  await freshPath.save();

  return {
    nextAssetId,
    reason,
    updatedPath: freshPath,
    preferredFormat,
    mastery: Number(user.mastery_map.get(topic) ?? 0.5),
  };
}
