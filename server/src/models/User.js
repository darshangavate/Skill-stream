  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema(
    {
      userId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["employee", "admin"], default: "employee" },
      learning_style_preference: { type: String, default: "mixed" },
      mastery_map: { type: Map, of: Number, default: {} },
      format_stats: {
        video: { attempts: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
        doc: { attempts: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
        infographic: { attempts: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
        lab: { attempts: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
      },
    },
    { timestamps: true }
  );

  export default mongoose.model("User", userSchema);
