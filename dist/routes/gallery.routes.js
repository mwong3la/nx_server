"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gallery_controller_1 = require("../controllers/gallery.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../middlewares/upload");
const galleryRouter = (0, express_1.Router)();
// Public routes (no auth required)
galleryRouter.get("/public", gallery_controller_1.getAllGallery);
galleryRouter.get("/public/:id", gallery_controller_1.getGalleryById);
// Admin routes (auth required)
galleryRouter.get("/", auth_middleware_1.isAuthenticated, gallery_controller_1.getAllGalleryAdmin);
galleryRouter.post("/", auth_middleware_1.isAuthenticated, upload_1.upload.single('image'), gallery_controller_1.createGallery);
galleryRouter.get("/:id", auth_middleware_1.isAuthenticated, gallery_controller_1.getGalleryById);
galleryRouter.put("/:id", auth_middleware_1.isAuthenticated, upload_1.upload.single('image'), gallery_controller_1.updateGallery);
galleryRouter.delete("/:id", auth_middleware_1.isAuthenticated, gallery_controller_1.deleteGallery);
exports.default = galleryRouter;
