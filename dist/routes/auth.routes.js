"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const authRouter = (0, express_1.Router)();
authRouter.post('/login', auth_controller_1.login);
authRouter.post('/signup', auth_controller_1.signup);
authRouter.post('/logout', auth_controller_1.logout);
authRouter.get('/me', auth_middleware_1.default, auth_controller_1.me);
exports.default = authRouter;
