import mongoose from "mongoose";

const pathSchema = new mongoose.Schema(
  {
    pathId: { type: String, required: true, unique: true },
    userId: String,
    courseId: String,
    nodes: [
      {
        assetId: String,
        status: String,
        addedBy: String,
      },
    ],
    currentIndex: Number,
    nextAssetId: String,
    lastUpdatedReason: String,
    etaMinutes: Number,
    updatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Path", pathSchema);
