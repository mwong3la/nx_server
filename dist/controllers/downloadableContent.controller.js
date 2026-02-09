"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementDownloadCount = exports.deleteDownloadableContent = exports.updateDownloadableContent = exports.createDownloadableContent = exports.getDownloadableContentById = exports.getAllDownloadableContentAdmin = exports.getAllDownloadableContent = void 0;
const DownloadableContent_1 = require("../database/models/DownloadableContent");
const uploadToAzure_1 = require("../utils/uploadToAzure");
// Get all downloadable content (public endpoint - only active)
const getAllDownloadableContent = async (req, res) => {
    try {
        const content = await DownloadableContent_1.DownloadableContent.findAll({
            where: { isActive: true },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: content
        });
    }
    catch (error) {
        console.error('Error fetching downloadable content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch downloadable content',
            error: error.message
        });
    }
};
exports.getAllDownloadableContent = getAllDownloadableContent;
// Get all downloadable content (admin endpoint - includes inactive)
const getAllDownloadableContentAdmin = async (req, res) => {
    try {
        const content = await DownloadableContent_1.DownloadableContent.findAll({
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: content
        });
    }
    catch (error) {
        console.error('Error fetching downloadable content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch downloadable content',
            error: error.message
        });
    }
};
exports.getAllDownloadableContentAdmin = getAllDownloadableContentAdmin;
// Get single downloadable content item
const getDownloadableContentById = async (req, res) => {
    try {
        const { id } = req.params;
        const contentItem = await DownloadableContent_1.DownloadableContent.findByPk(id);
        if (!contentItem) {
            res.status(404).json({
                success: false,
                message: 'Downloadable content not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: contentItem
        });
    }
    catch (error) {
        console.error('Error fetching downloadable content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch downloadable content',
            error: error.message
        });
    }
};
exports.getDownloadableContentById = getDownloadableContentById;
// Create downloadable content
const createDownloadableContent = async (req, res) => {
    try {
        const { title, description, category, isActive } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'File is required'
            });
            return;
        }
        const fileUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
        const contentItem = await DownloadableContent_1.DownloadableContent.create({
            title,
            description: description || null,
            fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype || null,
            fileSize: file.size || null,
            category: category || null,
            downloadCount: 0,
            isActive: isActive !== undefined ? isActive : true
        });
        res.status(201).json({
            success: true,
            message: 'Downloadable content created successfully',
            data: contentItem
        });
    }
    catch (error) {
        console.error('Error creating downloadable content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create downloadable content',
            error: error.message
        });
    }
};
exports.createDownloadableContent = createDownloadableContent;
// Update downloadable content
const updateDownloadableContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, isActive } = req.body;
        const file = req.file;
        const contentItem = await DownloadableContent_1.DownloadableContent.findByPk(id);
        if (!contentItem) {
            res.status(404).json({
                success: false,
                message: 'Downloadable content not found'
            });
            return;
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (category !== undefined)
            updateData.category = category;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (file) {
            updateData.fileUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
            updateData.fileName = file.originalname;
            updateData.fileType = file.mimetype || null;
            updateData.fileSize = file.size || null;
        }
        await contentItem.update(updateData);
        res.status(200).json({
            success: true,
            message: 'Downloadable content updated successfully',
            data: contentItem
        });
    }
    catch (error) {
        console.error('Error updating downloadable content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update downloadable content',
            error: error.message
        });
    }
};
exports.updateDownloadableContent = updateDownloadableContent;
// Delete downloadable content
const deleteDownloadableContent = async (req, res) => {
    try {
        const { id } = req.params;
        const contentItem = await DownloadableContent_1.DownloadableContent.findByPk(id);
        if (!contentItem) {
            res.status(404).json({
                success: false,
                message: 'Downloadable content not found'
            });
            return;
        }
        await contentItem.destroy();
        res.status(200).json({
            success: true,
            message: 'Downloadable content deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting downloadable content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete downloadable content',
            error: error.message
        });
    }
};
exports.deleteDownloadableContent = deleteDownloadableContent;
// Increment download count
const incrementDownloadCount = async (req, res) => {
    try {
        const { id } = req.params;
        const contentItem = await DownloadableContent_1.DownloadableContent.findByPk(id);
        if (!contentItem) {
            res.status(404).json({
                success: false,
                message: 'Downloadable content not found'
            });
            return;
        }
        await contentItem.increment('downloadCount');
        res.status(200).json({
            success: true,
            message: 'Download count incremented'
        });
    }
    catch (error) {
        console.error('Error incrementing download count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to increment download count',
            error: error.message
        });
    }
};
exports.incrementDownloadCount = incrementDownloadCount;
