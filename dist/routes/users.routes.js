"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const auth_middleware_2 = require("../middlewares/auth.middleware");
const rbac_types_1 = require("../types/rbac.types");
const userRouter = express_1.default.Router();
userRouter.get('/', auth_middleware_1.default, (0, auth_middleware_2.requireRole)([rbac_types_1.UserRole.ADMIN]), user_controller_1.getUsers);
userRouter.get('/:id', auth_middleware_1.default, (0, auth_middleware_2.requireRole)([rbac_types_1.UserRole.ADMIN]), user_controller_1.getUser);
exports.default = userRouter;
