const asyncHandler = require("../utils/asyncHandler");
const insightsService = require("../services/insights.service");

const getInsights = asyncHandler(async (req, res) => {
  const insights = await insightsService.getInsights(req.user.id);
  res.status(200).json(insights);
});

module.exports = {
  getInsights,
};

