"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("../controllers/news.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../middlewares/upload");
const newsRouter = (0, express_1.Router)();
// Public routes (no auth required)
newsRouter.get("/public", news_controller_1.getAllNews);
newsRouter.get("/public/:id", news_controller_1.getNewsById);
// Admin routes (auth required)
newsRouter.get("/", auth_middleware_1.isAuthenticated, news_controller_1.getAllNewsAdmin);
newsRouter.post("/", auth_middleware_1.isAuthenticated, upload_1.upload.single('image'), news_controller_1.createNews);
newsRouter.get("/:id", auth_middleware_1.isAuthenticated, news_controller_1.getNewsById);
newsRouter.put("/:id", auth_middleware_1.isAuthenticated, upload_1.upload.single('image'), news_controller_1.updateNews);
newsRouter.delete("/:id", auth_middleware_1.isAuthenticated, news_controller_1.deleteNews);
exports.default = newsRouter;
