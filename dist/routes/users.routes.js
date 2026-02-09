"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rbac_types_1 = require("../types/rbac.types");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRouter = express_1.default.Router();
userRouter.post('/', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.CREATE_USER), user_controller_1.createUser);
userRouter.get('/', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_USER), user_controller_1.getUsers);
userRouter.get('/:userId', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_USER), user_controller_1.getUser);
userRouter.put('/:userId', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_USER), user_controller_1.updateUser);
userRouter.put('/:userId/role', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_USER), user_controller_1.updateUserRole);
userRouter.delete('/:userId', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.DELETE_USER), user_controller_1.deactivateUser);
userRouter.patch('/:userId', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_USER), user_controller_1.activateUser);
exports.default = userRouter;
