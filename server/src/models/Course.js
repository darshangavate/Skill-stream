import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    skillTags: [String],
    moduleAssetIds: [String],
    createdBy: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
