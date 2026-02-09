"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGallery = exports.updateGallery = exports.createGallery = exports.getGalleryById = exports.getAllGalleryAdmin = exports.getAllGallery = void 0;
const Gallery_1 = require("../database/models/Gallery");
const uploadToAzure_1 = require("../utils/uploadToAzure");
// Get all gallery items (public endpoint - no auth required for viewing)
const getAllGallery = async (req, res) => {
    try {
        const gallery = await Gallery_1.Gallery.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC'], ['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: gallery
        });
    }
    catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery',
            error: error.message
        });
    }
};
exports.getAllGallery = getAllGallery;
// Get all gallery items (admin endpoint - includes inactive)
const getAllGalleryAdmin = async (req, res) => {
    try {
        const gallery = await Gallery_1.Gallery.findAll({
            order: [['displayOrder', 'ASC'], ['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: gallery
        });
    }
    catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery',
            error: error.message
        });
    }
};
exports.getAllGalleryAdmin = getAllGalleryAdmin;
// Get single gallery item
const getGalleryById = async (req, res) => {
    try {
        const { id } = req.params;
        const galleryItem = await Gallery_1.Gallery.findByPk(id);
        if (!galleryItem) {
            res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: galleryItem
        });
    }
    catch (error) {
        console.error('Error fetching gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery item',
            error: error.message
        });
    }
};
exports.getGalleryById = getGalleryById;
// Create gallery item
const createGallery = async (req, res) => {
    try {
        const { title, description, altText, displayOrder, isActive } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'Image file is required'
            });
            return;
        }
        const imageUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
        const galleryItem = await Gallery_1.Gallery.create({
            title,
            description: description || null,
            imageUrl,
            altText: altText || null,
            displayOrder: displayOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        });
        res.status(201).json({
            success: true,
            message: 'Gallery item created successfully',
            data: galleryItem
        });
    }
    catch (error) {
        console.error('Error creating gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create gallery item',
            error: error.message
        });
    }
};
exports.createGallery = createGallery;
// Update gallery item
const updateGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, altText, displayOrder, isActive } = req.body;
        const file = req.file;
        const galleryItem = await Gallery_1.Gallery.findByPk(id);
        if (!galleryItem) {
            res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
            return;
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (altText !== undefined)
            updateData.altText = altText;
        if (displayOrder !== undefined)
            updateData.displayOrder = displayOrder;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (file) {
            updateData.imageUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
        }
        await galleryItem.update(updateData);
        res.status(200).json({
            success: true,
            message: 'Gallery item updated successfully',
            data: galleryItem
        });
    }
    catch (error) {
        console.error('Error updating gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update gallery item',
            error: error.message
        });
    }
};
exports.updateGallery = updateGallery;
// Delete gallery item
const deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const galleryItem = await Gallery_1.Gallery.findByPk(id);
        if (!galleryItem) {
            res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
            return;
        }
        await galleryItem.destroy();
        res.status(200).json({
            success: true,
            message: 'Gallery item deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete gallery item',
            error: error.message
        });
    }
};
exports.deleteGallery = deleteGallery;
