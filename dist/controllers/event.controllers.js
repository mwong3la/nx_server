"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventUser = exports.getPartnersByEvent = exports.getParticipantsByEvent = exports.getVolunteersByEvent = exports.uploadHandler = exports.deleteMedia = exports.uploadMedia = exports.getMediaByEvent = exports.completeEvent = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const sequelize_1 = require("sequelize");
const Goal_1 = __importDefault(require("../database/models/Goal"));
const Event_1 = __importStar(require("../database/models/Event"));
const Media_1 = require("../database/models/Media");
const uploadToAzure_1 = require("../utils/uploadToAzure");
const azureBlob_1 = require("../lib/azureBlob");
const xlsx_1 = __importDefault(require("xlsx"));
const Volunteer_1 = require("../database/models/Volunteer");
const Participant_1 = require("../database/models/Participant");
const Partner_1 = require("../database/models/Partner");
const getEvents = async (req, res) => {
    try {
        const { status, category, region, goalId, startDate, endDate, search } = req.query;
        // Build where clause based on filters
        const whereClause = {};
        whereClause.organizationId = req.user.organizationId;
        if (status)
            whereClause.status = status;
        if (category)
            whereClause.category = category;
        if (region)
            whereClause.region = region;
        if (goalId)
            whereClause.strategicGoalId = goalId;
        // Date range filtering
        if (startDate && endDate) {
            whereClause.eventDate = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        else if (startDate) {
            whereClause.eventDate = {
                [sequelize_1.Op.gte]: new Date(startDate)
            };
        }
        else if (endDate) {
            whereClause.eventDate = {
                [sequelize_1.Op.lte]: new Date(endDate)
            };
        }
        // Search functionality
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search}%` } },
                { description: { [sequelize_1.Op.like]: `%${search}%` } }
            ];
        }
        const events = await Event_1.default.findAll({
            where: whereClause,
            include: [
                { model: Goal_1.default, as: 'goal' },
                // { model: User, as: 'creator' },
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: events
        });
    }
    catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};
exports.getEvents = getEvents;
/**
 * Get a single event by ID
 */
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.default.findByPk(id, {
            include: [
                { model: Goal_1.default, as: 'goal' },
            ]
        });
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Event not found'
            });
            return;
        }
        const goal = await Goal_1.default.findByPk(event.goal.id);
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const json = event.toJSON();
        res.status(200).json({
            success: true,
            data: { ...json, timeProgress: goal.timeProgress, }
        });
    }
    catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
};
exports.getEventById = getEventById;
/**
 * Create a new event
 */
const createEvent = async (req, res) => {
    try {
        const { title, description, category, location, startDate, endDate, status = Event_1.EventStatus.DRAFT, goalId, expectedParticipants, budget, outcomes } = req.body;
        // Validate required fields
        if (!title || !description || !category || !location || !startDate || !endDate || !goalId) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }
        // Check if related goal exists
        const goal = await Goal_1.default.findByPk(goalId);
        if (!goal) {
            res.status(400).json({
                success: false,
                message: 'Goal not found'
            });
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
            return;
        }
        // Create event
        const event = await Event_1.default.create({
            title,
            description,
            category,
            location,
            startDate,
            endDate,
            status,
            goalId,
            createdById: req.user?.id,
            expectedParticipants,
            budget,
            outcomes,
            organizationId: req.user.organizationId
        });
        goal.save();
        res.status(201).json({
            success: true,
            data: event,
            message: 'Event created successfully'
        });
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    }
};
exports.createEvent = createEvent;
/**
 * Update an existing event
 */
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        // Find event
        const event = await Event_1.default.findByPk(id);
        const { title, description, category, location, startDate, endDate, status, goalId, expectedParticipants, actualParticipants, budget, outcomes, mediaUrls } = req.body || {};
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Event not found'
            });
            return;
        }
        // Check status transition
        if (status && status !== event.status) {
            // Implement status workflow validation
            const validTransitions = {
                [Event_1.EventStatus.DRAFT]: [Event_1.EventStatus.SUBMITTED],
                [Event_1.EventStatus.SUBMITTED]: [Event_1.EventStatus.APPROVED, Event_1.EventStatus.CANCELLED],
                [Event_1.EventStatus.APPROVED]: [Event_1.EventStatus.COMPLETED, Event_1.EventStatus.CANCELLED],
                [Event_1.EventStatus.COMPLETED]: [],
                [Event_1.EventStatus.CANCELLED]: []
            };
            if (!validTransitions[event.status].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid status transition from ${event.status} to ${status}`
                });
                return;
            }
        }
        // If changing to completed status, ensure post-event data is provided
        if (status === Event_1.EventStatus.COMPLETED && (!actualParticipants || !outcomes)) {
            res.status(400).json({
                success: false,
                message: 'Post-event data required to mark event as completed'
            });
            return;
        }
        // If strategic goal is being changed, check if the new one exists
        if (goalId && goalId !== event.goalId) {
            const goal = await Goal_1.default.findByPk(goalId);
            if (!goal) {
                res.status(400).json({
                    success: false,
                    message: 'Goal not found'
                });
                return;
            }
        }
        // Update event
        await event.update({
            title: title || event.title,
            description: description || event.description,
            category: category || event.category,
            location: location || event.location,
            startDate: startDate || event.startDate,
            endDate: endDate || event.endDate,
            status: status || event.status,
            goalId: goalId || event.goalId,
            expectedParticipants: expectedParticipants !== undefined ? expectedParticipants : event.expectedParticipants,
            actualParticipants: actualParticipants !== undefined ? actualParticipants : event.actualParticipants,
            budget: budget !== undefined ? budget : event.budget,
            outcomes: outcomes || event.outcomes,
            mediaUrls: mediaUrls || event.mediaUrls,
            lastUpdatedBy: req.user?.id
        });
        res.status(200).json({
            success: true,
            data: event,
            message: 'Event updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    }
};
exports.updateEvent = updateEvent;
/**
 * Delete an event
 */
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.default.findByPk(id);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Event not found'
            });
            return;
        }
        // Prevent deletion of events that are not in draft or rejected status
        if (![Event_1.EventStatus.DRAFT, Event_1.EventStatus.SUBMITTED, Event_1.EventStatus.CANCELLED].includes(event.status)) {
            res.status(400).json({
                success: false,
                message: `Cannot delete events with ${event.status} status`
            });
            return;
        }
        // Delete the event
        await event.destroy();
        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    }
};
exports.deleteEvent = deleteEvent;
const completeEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { actualParticipants, outcomes } = req.body;
        if (!actualParticipants || !outcomes) {
            res.status(400).json({
                success: false,
                message: 'Actual participants count and outcomes are required'
            });
            return;
        }
        const event = await Event_1.default.findByPk(id);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Event not found'
            });
            return;
        }
        // Verify event is in appropriate status
        if (event.status !== 'Approved') {
            res.status(400).json({
                success: false,
                message: 'Only approved events can be completed'
            });
            return;
        }
        // Update event with completion data
        await event.update({
            status: Event_1.EventStatus.COMPLETED,
            actualParticipants,
            outcomes,
            completedById: req.user?.id
        });
        res.status(200).json({
            success: true,
            message: 'Event marked as completed successfully',
            data: event
        });
    }
    catch (error) {
        console.error('Error completing event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete event',
            error: error.message
        });
    }
};
exports.completeEvent = completeEvent;
const getMediaByEvent = async (req, res) => {
    const { id: eventId } = req.params;
    try {
        const media = await Media_1.Media.findAll({ where: { eventId } });
        res.json({ data: media });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};
exports.getMediaByEvent = getMediaByEvent;
const uploadMedia = async (req, res) => {
    const { id: eventId } = req.params;
    const files = req.files;
    if (!files || !files.length) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
    }
    try {
        const uploaded = await Promise.all(files.map(async (file) => {
            const url = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
            return Media_1.Media.create({
                url,
                type: file.mimetype,
                size: file.size,
                name: file.originalname,
                eventId: eventId,
            });
        }));
        res.status(201).json({ data: uploaded });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
};
exports.uploadMedia = uploadMedia;
const deleteMedia = async (req, res) => {
    const { id } = req.params;
    try {
        const media = await Media_1.Media.findByPk(id);
        if (!media) {
            res.status(404).json({ error: 'Media not found' });
            return;
        }
        const blobUrl = new URL(media.url);
        const blobPath = decodeURIComponent(blobUrl.pathname.split('/').pop() || '');
        const blobClient = azureBlob_1.containerClient.getBlockBlobClient(blobPath);
        await blobClient.deleteIfExists();
        await media.destroy();
        res.json({ message: 'Media deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete media' });
    }
};
exports.deleteMedia = deleteMedia;
const requiredColumnsMap = {
    volunteers: ['name', 'task'],
    participants: ['name', 'role', 'age', 'contact', 'address'],
};
const uploadHandler = async (req, res) => {
    try {
        const { type, eventId } = req.params;
        const buffer = req.file?.buffer;
        if (!buffer) {
            res.status(400).send('No file uploaded');
            return;
        }
        const workbook = xlsx_1.default.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx_1.default.utils.sheet_to_json(sheet);
        if (!['volunteers', 'participants', 'partners'].includes(type)) {
            res.status(400).send('Invalid type');
            return;
        }
        const requiredColumnsMap = {
            volunteers: ['name', 'task'],
            participants: ['name', 'role', 'age', 'contact', 'address'],
            partners: ['name', 'role'],
        };
        const requiredColumns = requiredColumnsMap[type];
        const firstRow = data[0];
        if (!firstRow) {
            res.status(400).send('Sheet is empty');
            return;
        }
        const fileColumns = Object.keys(firstRow).map(col => col.toLowerCase());
        const missing = requiredColumns.filter(col => !fileColumns.includes(col.toLowerCase()));
        if (missing.length > 0) {
            res
                .status(400)
                .json({ error: `Missing required columns: ${missing.join(', ')}` });
            return;
        }
        if (type === 'volunteers') {
            const formatted = data.map(row => ({
                name: row['name'],
                task: row['task'],
                eventId,
            }));
            await Volunteer_1.Volunteer.bulkCreate(formatted);
        }
        else if (type === 'participants') {
            const formatted = data.map(row => ({
                name: row['name'],
                role: row['role'],
                age: Number(row['age']),
                contact: row['contact'],
                address: row['address'],
                eventId,
            }));
            await Participant_1.Participant.bulkCreate(formatted);
        }
        else if (type === 'partners') {
            const formatted = data.map(row => ({
                name: row['name'],
                role: row['role'],
                eventId,
            }));
            await Partner_1.Partner.bulkCreate(formatted);
        }
        res.status(200).send('Data imported successfully');
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
exports.uploadHandler = uploadHandler;
const getVolunteersByEvent = async (req, res) => {
    const { eventId } = req.params;
    if (!eventId || typeof eventId !== 'string') {
        res.status(400).json({ error: 'Invalid or missing eventId' });
        return;
    }
    try {
        const event = await Event_1.default.findByPk(eventId);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        const volunteers = await Volunteer_1.Volunteer.findAll({ where: { eventId } });
        res.status(200).json({ data: volunteers });
    }
    catch (err) {
        console.error('Error fetching volunteers:', err);
        res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
};
exports.getVolunteersByEvent = getVolunteersByEvent;
const getParticipantsByEvent = async (req, res) => {
    const { eventId } = req.params;
    if (!eventId || typeof eventId !== 'string') {
        res.status(400).json({ error: 'Invalid or missing eventId' });
        return;
    }
    try {
        const event = await Event_1.default.findByPk(eventId);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        const participants = await Participant_1.Participant.findAll({ where: { eventId } });
        res.status(200).json({ data: participants });
    }
    catch (err) {
        console.error('Error fetching participants:', err);
        res.status(500).json({ error: 'Failed to fetch participants' });
    }
};
exports.getParticipantsByEvent = getParticipantsByEvent;
const getPartnersByEvent = async (req, res) => {
    const { eventId } = req.params;
    if (!eventId || typeof eventId !== 'string') {
        res.status(400).json({ error: 'Invalid or missing eventId' });
        return;
    }
    try {
        const event = await Event_1.default.findByPk(eventId);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        const partners = await Partner_1.Partner.findAll({ where: { eventId } });
        res.status(200).json({ data: partners });
    }
    catch (err) {
        console.error('Error fetching partners:', err);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
};
exports.getPartnersByEvent = getPartnersByEvent;
const deleteEventUser = async (req, res) => {
    const { type, id } = req.params;
    try {
        if (type === 'volunteer') {
            const deleted = await Volunteer_1.Volunteer.destroy({ where: { id } });
            if (!deleted) {
                res.status(404).json({ error: 'Volunteer not found' });
                return;
            }
            ;
        }
        else if (type === 'participant') {
            const deleted = await Participant_1.Participant.destroy({ where: { id } });
            if (!deleted) {
                res.status(404).json({ error: 'Participant not found' });
                return;
            }
            ;
        }
        else if (type === 'partner') {
            const deleted = await Partner_1.Partner.destroy({ where: { id } });
            if (!deleted) {
                res.status(404).json({ error: 'Partner not found' });
                return;
            }
        }
        else {
            res.status(400).json({ error: 'Invalid type' });
            return;
        }
        res.status(200).json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteEventUser = deleteEventUser;
