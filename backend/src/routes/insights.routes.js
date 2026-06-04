const express = require("express");
const insightsController = require("../controllers/insights.controller");

const router = express.Router();

router.get("/", insightsController.getInsights);

module.exports = router;

