import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.js";

const app = express.Router();

// /api/v1/user/stats
app.get("/stats", adminOnly, getDashboardStats);

// /api/v1/user/pie]
app.get("/pie", adminOnly, getPieCharts );

// /api/v1/user/bar
app.get("/bar", adminOnly, getBarCharts );

// /api/v1/user/line 
app.get("/line", adminOnly, getLineCharts );

export default app;