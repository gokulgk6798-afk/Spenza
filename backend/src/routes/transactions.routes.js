const express = require("express");
const transactionsController = require("../controllers/transactions.controller");

const router = express.Router();

router.post("/parse", transactionsController.parseTransaction);
router.post("/", transactionsController.createTransaction);
router.get("/", transactionsController.getTransactions);

module.exports = router;

