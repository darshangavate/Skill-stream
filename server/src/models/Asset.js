import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    title: String,
    topic: String,
    format: String,
    difficulty: Number,
    level: String,
    prerequisites: [String],
    expectedTimeMin: Number,
    url: String,
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
