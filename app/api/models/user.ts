import mongoose from "mongoose";

/* =========================================================
   Recording Schema
========================================================= */
const RecordingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    audioUrl: { type: String, required: true },

    dateTime: { type: Date, required: true },
    durationMinutes: { type: Number },

    participants: [{ type: String }],
    transcript: { type: String },

    summary: {
      type: String,
      default: null,
    },

    /* -----------------------------
       SUMMARY EMAIL (Follow-up)
    ----------------------------- */
    summaryEmail: {
      subject: String,
      body: String,
      to: String,

      status: {
        type: String,
        enum: ["draft", "sent"],
        default: "draft",
      },

      sentAt: Date,
      updatedAt: Date,

      provider: {
        type: String,
        enum: ["gmail", "outlook"],
      },

      messageId: String,
      threadId: String, // Gmail
      conversationId: String, // Outlook
    },

    /* -----------------------------
       ACTION ITEMS
    ----------------------------- */
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

    isAnalyzed: {
      type: Boolean,
      default: false,
    },

    /* -----------------------------
       ACTION ITEM EMAILS
    ----------------------------- */
    emails: [
      {
        actionItemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          index: true,
        },

        subject: String,
        body: String,
        to: String,

        status: {
          type: String,
          enum: ["draft", "sent"],
          default: "draft",
        },

        sentAt: Date,

        createdAt: {
          type: Date,
          default: Date.now,
        },

        provider: {
          type: String,
          enum: ["gmail", "outlook"],
        },

        chat: [
          {
            role: String, // "user" | "assistant"
            content: String,
            createdAt: Date,
          },
        ],

        scheduledAt: { type: Date, required: false },
        messageId: String,
        threadId: String, // Gmail
        conversationId: String, // Outlook
      },
    ],
  },
  { timestamps: true },
);

/* =========================================================
   User Schema
========================================================= */
const UserSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: String,
    imageUrl: String,

    recordings: [RecordingSchema],

    /* =====================================================
       EMAIL PROVIDER (Single Source of Truth)
    ===================================================== */
    emailProvider: {
      type: String,
      enum: ["gmail", "outlook", null],
      default: null,
    },

    templates: [
      {
        name: { type: String, required: true },
        subject: String,
        body: String,
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    /* -----------------------------
       Gmail OAuth
    ----------------------------- */
    gmail: {
      type: {
        email: String,
        accessToken: String,
        refreshToken: String,
        expiryDate: Number,
      },
      default: undefined, // 🔥 prevents empty object
    },

    /* -----------------------------
       Outlook OAuth
    ----------------------------- */
    outlook: {
      type: {
        email: String,
        accessToken: String,
        refreshToken: String,
        expiryDate: Number,
      },
      default: undefined, // 🔥 prevents empty object
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
