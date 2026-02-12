import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    topic: String,
    difficulty: Number,
    prompt: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
