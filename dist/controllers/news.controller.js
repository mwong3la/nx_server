"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsById = exports.getAllNewsAdmin = exports.getAllNews = void 0;
const News_1 = require("../database/models/News");
const uploadToAzure_1 = require("../utils/uploadToAzure");
// Get all news items (public endpoint - only published)
const getAllNews = async (req, res) => {
    try {
        const news = await News_1.News.findAll({
            where: { isPublished: true },
            order: [['date', 'DESC'], ['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: news
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news',
            error: error.message
        });
    }
};
exports.getAllNews = getAllNews;
// Get all news items (admin endpoint - includes unpublished)
const getAllNewsAdmin = async (req, res) => {
    try {
        const news = await News_1.News.findAll({
            order: [['date', 'DESC'], ['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: news
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news',
            error: error.message
        });
    }
};
exports.getAllNewsAdmin = getAllNewsAdmin;
// Get single news item
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const newsItem = await News_1.News.findByPk(id);
        if (!newsItem) {
            res.status(404).json({
                success: false,
                message: 'News item not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: newsItem
        });
    }
    catch (error) {
        console.error('Error fetching news item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news item',
            error: error.message
        });
    }
};
exports.getNewsById = getNewsById;
// Create news item
const createNews = async (req, res) => {
    try {
        const { title, description, category, date, content, externalLink, isPublished } = req.body;
        const file = req.file;
        let imageUrl = null;
        if (file) {
            imageUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
        }
        const newsItem = await News_1.News.create({
            title,
            description: description || null,
            category: category || null,
            date: date ? new Date(date) : new Date(),
            imageUrl,
            content: content || null,
            externalLink: externalLink || null,
            isPublished: isPublished !== undefined ? isPublished : true
        });
        res.status(201).json({
            success: true,
            message: 'News item created successfully',
            data: newsItem
        });
    }
    catch (error) {
        console.error('Error creating news item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create news item',
            error: error.message
        });
    }
};
exports.createNews = createNews;
// Update news item
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, date, content, externalLink, isPublished } = req.body;
        const file = req.file;
        const newsItem = await News_1.News.findByPk(id);
        if (!newsItem) {
            res.status(404).json({
                success: false,
                message: 'News item not found'
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
        if (date !== undefined)
            updateData.date = new Date(date);
        if (content !== undefined)
            updateData.content = content;
        if (externalLink !== undefined)
            updateData.externalLink = externalLink;
        if (isPublished !== undefined)
            updateData.isPublished = isPublished;
        if (file) {
            updateData.imageUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
        }
        await newsItem.update(updateData);
        res.status(200).json({
            success: true,
            message: 'News item updated successfully',
            data: newsItem
        });
    }
    catch (error) {
        console.error('Error updating news item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update news item',
            error: error.message
        });
    }
};
exports.updateNews = updateNews;
// Delete news item
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const newsItem = await News_1.News.findByPk(id);
        if (!newsItem) {
            res.status(404).json({
                success: false,
                message: 'News item not found'
            });
            return;
        }
        await newsItem.destroy();
        res.status(200).json({
            success: true,
            message: 'News item deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting news item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete news item',
            error: error.message
        });
    }
};
exports.deleteNews = deleteNews;
