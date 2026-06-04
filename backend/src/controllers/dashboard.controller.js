const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboard.service");

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.user.id);
  res.status(200).json(dashboard);
});

module.exports = {
  getDashboard,
};

