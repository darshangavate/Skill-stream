import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    enrollmentId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    status: { type: String, enum: ["active", "completed", "paused"], default: "active" },
    enrolledAt: Date,
    targetPace: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
