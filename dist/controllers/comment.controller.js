"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getReplies = exports.getComments = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../database/models/Comment"));
const createComment = async (req, res) => {
    const userId = req.user?.id;
    try {
        const { body, commentableId, commentableType, parentId, } = req.body;
        const comment = await Comment_1.default.create({
            body,
            commentableId,
            commentableType,
            parentId: parentId || null,
            userId,
        });
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create comment', error });
    }
};
exports.createComment = createComment;
const getComments = async (req, res) => {
    try {
        const { commentableType, commentableId } = req.params;
        const comments = await Comment_1.default.findAll({
            where: {
                commentableType,
                commentableId,
                parentId: null,
            },
            include: [{ association: 'replies' }, { association: 'user' }],
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments', error });
    }
};
exports.getComments = getComments;
const getReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const replies = await Comment_1.default.findAll({
            where: { parent_id: commentId },
            include: [{ association: 'user' }],
            order: [['created_at', 'ASC']],
        });
        res.status(200).json(replies);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch replies', error });
    }
};
exports.getReplies = getReplies;
const updateComment = async (req, res) => {
    const userId = req.user?.id;
    const { commentId } = req.params;
    const { body } = req.body;
    try {
        const comment = await Comment_1.default.findByPk(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        if (comment.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized to update this comment' });
            return;
        }
        comment.body = body;
        await comment.save();
        res.status(200).json(comment);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update comment', error });
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    const userId = req.user?.id;
    const { commentId } = req.params;
    try {
        const comment = await Comment_1.default.findByPk(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        if (comment.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized to delete this comment' });
            return;
        }
        await comment.destroy();
        res.status(200).json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error });
    }
};
exports.deleteComment = deleteComment;
