"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawFromEvent = exports.updateVolunteerStatus = exports.markAttended = exports.getMyEvents = exports.registerToEvent = void 0;
const Event_1 = __importDefault(require("../database/models/Event"));
const Volunteer_1 = require("../database/models/Volunteer");
const registerToEvent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { eventId } = req.body;
        if (!userId || !eventId) {
            res.status(400).json({ message: 'User or event ID missing' });
            return;
        }
        const event = await Event_1.default.findByPk(eventId);
        if (!event) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }
        const existing = await Volunteer_1.EventVolunteer.findOne({ where: { userId, eventId } });
        if (existing) {
            res.status(409).json({ message: 'Already registered for this event' });
            return;
        }
        const volunteer = await Volunteer_1.EventVolunteer.create({
            userId,
            eventId,
            status: Volunteer_1.VolunteerStatus.PENDING,
        });
        res.status(201).json({ message: 'Registration successful', volunteer });
    }
    catch (error) {
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.registerToEvent = registerToEvent;
const getMyEvents = async (req, res) => {
    try {
        const userId = req.user?.id;
        const volunteering = await Volunteer_1.EventVolunteer.findAll({
            where: { userId },
            include: [Event_1.default],
            order: [['created_at', 'DESC']],
        });
        const response = volunteering.map(v => ({
            volunteerId: v.id,
            status: v.status,
            event: {
                id: v.event.id,
                title: v.event.title,
                description: v.event.description,
                category: v.event.category,
                startDate: v.event.startDate,
                endDate: v.event.endDate,
                location: v.event.location,
                outcomes: v.event.outcomes
            }
        }));
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching volunteer events:', error);
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.getMyEvents = getMyEvents;
const markAttended = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const volunteer = await Volunteer_1.EventVolunteer.findByPk(volunteerId);
        if (!volunteer) {
            res.status(400).json({
                success: false,
                message: 'Error updating volunteer status',
                error: "Volunteer record not found",
            });
            return;
        }
        if (volunteer.status === Volunteer_1.VolunteerStatus.CANCELLED_BY_VOLUNTEER) {
            res.status(400).json({
                success: false,
                message: 'Error updating volunteer status',
                error: "Cannot update status: volunteer cancelled participation",
            });
            return;
        }
        if (volunteer.status !== Volunteer_1.VolunteerStatus.APPROVED) {
            res.status(400).json({
                success: false,
                message: 'Error updating participation status',
                error: "Participation must be approved first!",
            });
            return;
        }
        volunteer.status = Volunteer_1.VolunteerStatus.ATTENDED;
        await volunteer.save();
        res.status(200).json({ message: 'Volunteer status updated', volunteer });
    }
    catch (error) {
        console.error('Error updating volunteer status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating volunteer status',
            error: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.markAttended = markAttended;
const updateVolunteerStatus = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const { status } = req.body;
        if (!Object.values(Volunteer_1.VolunteerStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid status value' });
            return;
        }
        // const isAdmin = req.user?.isAdmin;
        // if (!isAdmin) {
        //      res.status(403).json({ message: 'Only admins can update the volunteer status' });
        //      return
        // }
        const volunteer = await Volunteer_1.EventVolunteer.findByPk(volunteerId);
        if (!volunteer) {
            res.status(404).json({ message: 'Volunteer record not found' });
            res.status(400).json({
                success: false,
                message: 'Error updating volunteer status',
                error: "Volunteer record not found",
            });
            return;
        }
        if (volunteer.status === Volunteer_1.VolunteerStatus.CANCELLED_BY_VOLUNTEER) {
            res.status(400).json({
                success: false,
                message: 'Error updating volunteer status',
                error: "Cannot update status: volunteer cancelled participation",
            });
            return;
        }
        if (status === Volunteer_1.VolunteerStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'Error updating volunteer status',
                error: "Updating status to pending is not allowed.",
            });
            return;
        }
        volunteer.status = status;
        await volunteer.save();
        res.status(200).json({ message: 'Volunteer status updated', volunteer });
    }
    catch (error) {
        console.error('Error updating volunteer status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating volunteer status',
            error: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.updateVolunteerStatus = updateVolunteerStatus;
const withdrawFromEvent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { volunteerId } = req.params;
        const volunteer = await Volunteer_1.EventVolunteer.findByPk(volunteerId);
        if (!volunteer) {
            res.status(404).json({
                success: false,
                message: 'Error withdrawing from event',
                error: "Not found",
            });
            return;
        }
        if (volunteer.userId !== userId) {
            res.status(403).json({
                success: false,
                message: 'Error withdrawing from event',
                error: "Unauthorized",
            });
            return;
        }
        if ([Volunteer_1.VolunteerStatus.CANCELLED_BY_VOLUNTEER, Volunteer_1.VolunteerStatus.COMPLETED, Volunteer_1.VolunteerStatus.ATTENDED].includes(volunteer.status)) {
            res.status(400).json({
                success: false,
                message: 'Error withdrawing from event',
                error: "Cannot withdraw from this event or already withdrawn.",
            });
            return;
        }
        volunteer.status = Volunteer_1.VolunteerStatus.CANCELLED_BY_VOLUNTEER;
        await volunteer.save();
        res.status(200).json({
            success: true,
            message: 'You have withdrawn from the event',
            data: volunteer
        });
    }
    catch (error) {
        console.error('Error withdrawing from event:', error);
        res.status(500).json({
            success: false,
            message: 'Error withdrawing from event',
            error: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.withdrawFromEvent = withdrawFromEvent;
