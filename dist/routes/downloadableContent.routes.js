"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const downloadableContent_controller_1 = require("../controllers/downloadableContent.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../middlewares/upload");
const downloadableContentRouter = (0, express_1.Router)();
// Public routes (no auth required)
downloadableContentRouter.get("/public", downloadableContent_controller_1.getAllDownloadableContent);
downloadableContentRouter.get("/public/:id", downloadableContent_controller_1.getDownloadableContentById);
downloadableContentRouter.post("/public/:id/download", downloadableContent_controller_1.incrementDownloadCount);
// Admin routes (auth required)
downloadableContentRouter.get("/", auth_middleware_1.isAuthenticated, downloadableContent_controller_1.getAllDownloadableContentAdmin);
downloadableContentRouter.post("/", auth_middleware_1.isAuthenticated, upload_1.upload.single('file'), downloadableContent_controller_1.createDownloadableContent);
downloadableContentRouter.get("/:id", auth_middleware_1.isAuthenticated, downloadableContent_controller_1.getDownloadableContentById);
downloadableContentRouter.put("/:id", auth_middleware_1.isAuthenticated, upload_1.upload.single('file'), downloadableContent_controller_1.updateDownloadableContent);
downloadableContentRouter.delete("/:id", auth_middleware_1.isAuthenticated, downloadableContent_controller_1.deleteDownloadableContent);
exports.default = downloadableContentRouter;
