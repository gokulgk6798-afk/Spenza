const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "other",
    },
    vendor: {
      type: String,
      default: "",
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ["chat", "sms", "notification", "manual"],
      default: "chat",
    },
    sources: {
      type: [String],
      default: [],
    },
    rawText: {
      type: String,
      default: "",
    },
    sourceReferenceHash: {
      type: String,
      default: "",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "",
      trim: true,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    sourceMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    mergeCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index(
  { userId: 1, sourceReferenceHash: 1 },
  { unique: true, partialFilterExpression: { sourceReferenceHash: { $type: "string", $gt: "" } } }
);

module.exports = mongoose.model("Transaction", transactionSchema);
