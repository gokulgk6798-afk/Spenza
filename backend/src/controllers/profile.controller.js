const asyncHandler = require("../utils/asyncHandler");
const profileService = require("../services/profile.service");

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ profile: await profileService.getProfile(req.user.id) });
});

const updateProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ profile: await profileService.updateProfile(req.user.id, req.body) });
});

const updatePreferences = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json({ preferences: await profileService.updatePreferences(req.user.id, req.body) });
});

const listLinkedAccounts = asyncHandler(async (req, res) => {
  res.status(200).json(await profileService.listLinkedAccounts(req.user.id));
});

const addLinkedAccount = asyncHandler(async (req, res) => {
  res.status(201).json(await profileService.addLinkedAccount(req.user.id, req.body));
});

const removeLinkedAccount = asyncHandler(async (req, res) => {
  res.status(200).json(await profileService.removeLinkedAccount(req.user.id, req.params.id));
});

const addPaymentMethod = asyncHandler(async (req, res) => {
  res.status(201).json(await profileService.addPaymentMethod(req.user.id, req.body));
});

module.exports = {
  addLinkedAccount,
  addPaymentMethod,
  getProfile,
  listLinkedAccounts,
  removeLinkedAccount,
  updatePreferences,
  updateProfile,
};
