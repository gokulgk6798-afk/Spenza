const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    authProviders: {
      type: [String],
      default: ["email"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      default: "",
      trim: true,
    },
    preferences: {
      currency: {
        type: String,
        default: "INR",
        trim: true,
        uppercase: true,
      },
      theme: {
        type: String,
        enum: ["dark", "light", "system"],
        default: "dark",
      },
      accentColor: {
        type: String,
        default: "#FF5533",
        trim: true,
      },
      fontSize: {
        type: String,
        enum: ["Small", "Medium", "Large"],
        default: "Medium",
      },
    },
    linkedAccounts: {
      type: [
        {
          accountType: {
            type: String,
            enum: ["bank", "upi"],
            default: "bank",
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          detail: {
            type: String,
            default: "",
            trim: true,
          },
          status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      ],
      default: [],
    },
    paymentMethods: {
      type: [
        {
          methodType: {
            type: String,
            enum: ["card"],
            default: "card",
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          detail: {
            type: String,
            default: "",
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
