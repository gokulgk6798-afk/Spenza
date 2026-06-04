const express = require("express");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/", profileController.getProfile);
router.patch("/", profileController.updateProfile);
router.patch("/preferences", profileController.updatePreferences);
router.get("/linked-accounts", profileController.listLinkedAccounts);
router.post("/linked-accounts", profileController.addLinkedAccount);
router.delete("/linked-accounts/:id", profileController.removeLinkedAccount);
router.post("/payment-methods", profileController.addPaymentMethod);

module.exports = router;
