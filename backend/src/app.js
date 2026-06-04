const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const authMiddleware = require("./middleware/auth.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const insightsRoutes = require("./routes/insights.routes");
const profileRoutes = require("./routes/profile.routes");
const budgetsRoutes = require("./routes/budgets.routes");

const app = express();

app.use(
  cors({
    origin: env.clientUrl === "*" ? true : env.clientUrl,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "spenza-backend" });
});

app.use("/auth", authRoutes);
app.use("/transactions", authMiddleware, transactionsRoutes);
app.use("/dashboard", authMiddleware, dashboardRoutes);
app.use("/insights", authMiddleware, insightsRoutes);
app.use("/profile", authMiddleware, profileRoutes);
app.use("/budgets", authMiddleware, budgetsRoutes);

app.use(errorMiddleware);

module.exports = app;
