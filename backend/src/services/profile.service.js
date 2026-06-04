const User = require("../models/User");
const HttpError = require("../utils/httpError");

function ensureUser(user) {
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  return user;
}

function toProfile(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName || "",
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "",
    preferences: {
      currency: user.preferences?.currency || "INR",
      theme: user.preferences?.theme || "dark",
      accentColor: user.preferences?.accentColor || "#FF5533",
      fontSize: user.preferences?.fontSize || "Medium",
    },
    linkedAccounts: (user.linkedAccounts || []).map((account) => ({
      id: account._id.toString(),
      accountType: account.accountType,
      name: account.name,
      detail: account.detail || "",
      status: account.status || "active",
    })),
    paymentMethods: (user.paymentMethods || []).map((method) => ({
      id: method._id.toString(),
      methodType: method.methodType,
      name: method.name,
      detail: method.detail || "",
    })),
  };
}

async function getProfile(userId) {
  const user = ensureUser(await User.findById(userId));
  return toProfile(user);
}

async function updateProfile(userId, payload) {
  const user = ensureUser(await User.findById(userId));
  const displayName = payload.displayName?.trim();
  const email = payload.email?.trim().toLowerCase();

  if (!displayName || displayName.length < 2) {
    throw new HttpError(400, "Full name must be at least 2 characters.");
  }
  if (!email || !email.includes("@")) {
    throw new HttpError(400, "A valid email is required.");
  }

  const existing = await User.findOne({ email, _id: { $ne: user._id } });
  if (existing) {
    throw new HttpError(409, "Email is already in use.");
  }

  user.displayName = displayName;
  user.email = email;
  user.phone = payload.phone?.trim() || "";
  user.dateOfBirth = payload.dateOfBirth?.trim() || "";
  user.gender = payload.gender?.trim() || "";
  await user.save();
  return toProfile(user);
}

async function updatePreferences(userId, payload) {
  const user = ensureUser(await User.findById(userId));
  const nextPreferences = {
    currency: payload.currency?.trim().toUpperCase() || user.preferences?.currency || "INR",
    theme: payload.theme || user.preferences?.theme || "dark",
    accentColor: payload.accentColor?.trim() || user.preferences?.accentColor || "#FF5533",
    fontSize: payload.fontSize || user.preferences?.fontSize || "Medium",
  };

  if (!/^[A-Z]{3}$/.test(nextPreferences.currency)) {
    throw new HttpError(400, "Currency must be a 3-letter code.");
  }
  if (!["dark", "light", "system"].includes(nextPreferences.theme)) {
    throw new HttpError(400, "Invalid theme preference.");
  }
  if (!["Small", "Medium", "Large"].includes(nextPreferences.fontSize)) {
    throw new HttpError(400, "Invalid font size preference.");
  }

  user.preferences = nextPreferences;
  await user.save();
  return toProfile(user).preferences;
}

async function listLinkedAccounts(userId) {
  return getProfile(userId).then((profile) => ({
    linkedAccounts: profile.linkedAccounts,
    paymentMethods: profile.paymentMethods,
  }));
}

async function addLinkedAccount(userId, payload) {
  const user = ensureUser(await User.findById(userId));
  const name = payload.name?.trim();
  if (!name) {
    throw new HttpError(400, "Account name is required.");
  }
  user.linkedAccounts.push({
    accountType: payload.accountType === "upi" ? "upi" : "bank",
    name,
    detail: payload.detail?.trim() || "",
    status: "active",
  });
  await user.save();
  return listLinkedAccounts(userId);
}

async function removeLinkedAccount(userId, accountId) {
  const user = ensureUser(await User.findById(userId));
  const account = user.linkedAccounts.id(accountId);
  if (!account) {
    throw new HttpError(404, "Linked account not found.");
  }
  account.deleteOne();
  await user.save();
  return listLinkedAccounts(userId);
}

async function addPaymentMethod(userId, payload) {
  const user = ensureUser(await User.findById(userId));
  const name = payload.name?.trim();
  if (!name) {
    throw new HttpError(400, "Payment method name is required.");
  }
  user.paymentMethods.push({
    methodType: "card",
    name,
    detail: payload.detail?.trim() || "",
  });
  await user.save();
  return listLinkedAccounts(userId);
}

module.exports = {
  addLinkedAccount,
  addPaymentMethod,
  getProfile,
  listLinkedAccounts,
  removeLinkedAccount,
  toProfile,
  updatePreferences,
  updateProfile,
};
