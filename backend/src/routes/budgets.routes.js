const express = require("express");
const budgetsController = require("../controllers/budgets.controller");

const router = express.Router();

router.get("/", budgetsController.listBudgets);
router.post("/", budgetsController.createBudget);
router.patch("/:id", budgetsController.updateBudget);

module.exports = router;
