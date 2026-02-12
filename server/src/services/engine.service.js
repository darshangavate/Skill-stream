import {
  getUserById,
  getAssets
} from "./dataStore.js";
import User from "../models/User.js";
import Path from "../models/Path.js";

export async function updateUserStatsAndPath({
  userId,
  path,
  asset,
  topic,
  score,
  wrongQuestionIds,
  timeSpentMin
}) {
  const user = await getUserById(userId);

  // Update format stats
  const format = asset.format;
  const stat = user.format_stats[format];

  stat.attempts += 1;
  stat.avgScore =
    (stat.avgScore * (stat.attempts - 1) + score) / stat.attempts;

  // Determine preference
  const formats = Object.entries(user.format_stats);
  formats.sort((a, b) => b[1].avgScore - a[1].avgScore);

  if (formats[0][1].avgScore - formats[1][1].avgScore > 10) {
    user.learning_style_preference = formats[0][0] + "_first";
  }

  // Update user in database
  await User.findOneAndUpdate({ userId }, user, { new: true });

  // Simple path update logic
  let reason = "Continuing normal path.";
  let nextAssetId = path.nextAssetId;

  const assets = await getAssets();
  const topicAssets = assets.filter(a => a.topic === topic);

  if (score < 60) {
    const easier = topicAssets.find(a =>
      a.difficulty < asset.difficulty &&
      a.format !== asset.format
    );

    if (easier) {
      nextAssetId = easier.assetId;
      reason = "Low score → switching format + easier asset.";
    }
  } else if (score > 90) {
    const advanced = topicAssets.find(a => a.level === "advanced");
    if (advanced) {
      nextAssetId = advanced.assetId;
      reason = "High score → jumping to advanced.";
    }
  }

  path.nextAssetId = nextAssetId;
  path.lastUpdatedReason = reason;

  // Update path in database
  await Path.findOneAndUpdate({ pathId: path.pathId }, path, { new: true });

  return {
    nextAssetId,
    reason,
    updatedPath: path
  };
}
