"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const reportsRouter = (0, express_1.Router)();
reportsRouter.get('/goals', report_controller_1.getGoalReport);
exports.default = reportsRouter;
