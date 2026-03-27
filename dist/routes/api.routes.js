"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const public_routes_1 = __importDefault(require("./public.routes"));
const apiRouter = (0, express_1.Router)();
apiRouter.use('/public', public_routes_1.default);
apiRouter.use('/auth', auth_routes_1.default);
apiRouter.use('/users', users_routes_1.default);
apiRouter.use('/admin', admin_routes_1.default);
exports.default = apiRouter;
