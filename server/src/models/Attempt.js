import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    attemptId: { type: String, required: true, unique: true },
    userId: String,
    courseId: String,
    pathId: String,
    assetId: String,
    topic: String,
    format: String,
    assetDifficulty: Number,
    timeSpentMin: Number,
    timeRatio: Number,
    askedQuestionIds: [String],
    wrongQuestionIds: [String],
    score: Number,
    attemptNo: Number,
    createdAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Attempt", attemptSchema);
