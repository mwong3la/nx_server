"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.listMessages = exports.openOrCreateConversation = exports.listConversations = void 0;
const sequelize_1 = require("sequelize");
const Conversation_1 = require("../database/models/Conversation");
const Message_1 = require("../database/models/Message");
const User_1 = require("../database/models/User");
const participants_1 = require("../utils/participants");
function conversationShape(c, viewerId) {
    const otherId = c.participant1Id === viewerId ? c.participant2Id : c.participant1Id;
    return {
        id: c.id,
        otherUserId: otherId,
        lastMessageAt: c.lastMessageAt?.toISOString?.() ?? null,
        createdAt: c.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const listConversations = async (req, res) => {
    try {
        const uid = req.user.id;
        const rows = await Conversation_1.Conversation.findAll({
            where: {
                [sequelize_1.Op.or]: [{ participant1Id: uid }, { participant2Id: uid }],
            },
            order: [['updatedAt', 'DESC']],
        });
        res.json({ conversations: rows.map((c) => conversationShape(c, uid)) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listConversations = listConversations;
const openOrCreateConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        const selfId = req.user.id;
        if (!participantId || typeof participantId !== 'string') {
            res.status(400).json({ message: 'participantId is required' });
            return;
        }
        if (participantId === selfId) {
            res.status(400).json({ message: 'Cannot start a conversation with yourself' });
            return;
        }
        const other = await User_1.User.findByPk(participantId);
        if (!other || !other.isActive) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const [p1, p2] = (0, participants_1.sortParticipantIds)(selfId, participantId);
        const [conv] = await Conversation_1.Conversation.findOrCreate({
            where: { participant1Id: p1, participant2Id: p2 },
            defaults: { participant1Id: p1, participant2Id: p2 },
        });
        res.status(201).json(conversationShape(conv, selfId));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.openOrCreateConversation = openOrCreateConversation;
async function assertParticipant(conversationId, userId) {
    return Conversation_1.Conversation.findOne({
        where: {
            id: conversationId,
            [sequelize_1.Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
        },
    });
}
const listMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.id;
        const conv = await assertParticipant(id, uid);
        if (!conv) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const { rows, count } = await Message_1.Message.findAndCountAll({
            where: { conversationId: id },
            order: [['createdAt', 'ASC']],
            limit,
            offset: (page - 1) * limit,
        });
        res.json({
            messages: rows.map((m) => ({
                id: m.id,
                senderId: m.senderId,
                body: m.body,
                createdAt: m.createdAt?.toISOString?.() ?? new Date().toISOString(),
            })),
            total: count,
            page,
            limit,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listMessages = listMessages;
const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req.body;
        const uid = req.user.id;
        if (!body || typeof body !== 'string' || !body.trim()) {
            res.status(400).json({ message: 'body is required' });
            return;
        }
        const conv = await assertParticipant(id, uid);
        if (!conv) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }
        const msg = await Message_1.Message.create({
            conversationId: id,
            senderId: uid,
            body: body.trim(),
        });
        await conv.update({ lastMessageAt: new Date() });
        res.status(201).json({
            id: msg.id,
            senderId: msg.senderId,
            body: msg.body,
            createdAt: msg.createdAt?.toISOString?.() ?? new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendMessage = sendMessage;
