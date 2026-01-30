import mongoose from "mongoose";

const RecordingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    audioUrl: { type: String, required: true },

    dateTime: { type: Date, required: true },
    durationMinutes: { type: Number },

    participants: [{ type: String }],

    transcript: { type: String },

    actionItems: [
      {
        text: { type: String, required: true },

        category: {
          type: String,
          enum: ["client", "seller"],
          required: true,
        },

        completed: { type: Boolean, default: false },
      },
    ],

    risks: [
      {
        title: String,
        description: String,
      },
    ],

    status: {
      type: String,
      enum: ["processing", "completed"],
      default: "processing",
    },

    // 👇 NEW FIELD
    isAnalyzed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: String,
    imageUrl: String,

    recordings: [RecordingSchema],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
