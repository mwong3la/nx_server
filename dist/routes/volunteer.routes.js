"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const volunteer_controllers_1 = require("../controllers/volunteer.controllers");
const authMidddleware_1 = __importDefault(require("../middlewares/authMidddleware"));
const volunteersRouter = (0, express_1.Router)();
volunteersRouter.put("/:id", authMidddleware_1.default, volunteer_controllers_1.updateVolunteerStatus);
exports.default = volunteersRouter;
