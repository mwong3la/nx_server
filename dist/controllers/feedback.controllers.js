"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbacksByStatus = exports.getPublicFeedbacks = exports.updateFeedbackStatus = exports.getAllFeedbacks = exports.deleteFeedback = exports.updateFeedbackContent = exports.getMyFeedback = void 0;
const Feedback_1 = require("../database/models/Feedback");
// 1. PRIVATE
// export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
//     try {
//         const userId = req.user?.id;
//         const {
//             eventId,
//             submittedByName,
//             submittedByEmail,
//             feedbackType,
//             content,
//             rating,
//         } = req.body;
//         const event = await Event.findByPk(eventId);
//         if (!event) {
//             res.status(404).json({ message: 'Event not found' });
//             return
//         }
//         const participation = await EventVolunteer.findOne({
//             where: {
//                 userId,
//                 eventId,
//                 status: [VolunteerStatus.ATTENDED, VolunteerStatus.COMPLETED],
//             },
//         });
//         if (!participation) {
//             res.status(403).json({
//                 message: 'You can only submit feedback for events you participated in.',
//             });
//             return
//         }
//         const feedback = await Feedback.create({
//             userId,
//             eventId,
//             submittedByName,
//             submittedByEmail,
//             feedbackType,
//             content,
//             rating,
//             isPublic: false,
//         });
//         res.status(201).json({ message: 'Feedback submitted', feedback });
//     } catch (error: any) {
//         console.error('Error submitting feedback:', error);
//         res.status(400).json({
//             error: 'Request failed',
//             details: error.errors?.map((e: any) => e.message) || error.message,
//         });;
//     }
// };
const getMyFeedback = async (req, res) => {
    try {
        const userId = req.user?.id;
        const feedbacks = await Feedback_1.Feedback.findAll({
            where: { userId },
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(feedbacks);
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
        ;
    }
};
exports.getMyFeedback = getMyFeedback;
const updateFeedbackContent = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const userId = req.user?.id;
        const { content, rating, feedbackType, submittedByName, submittedByEmail, } = req.body;
        const feedback = await Feedback_1.Feedback.findByPk(feedbackId);
        if (!feedback) {
            res.status(404).json({ message: 'Feedback not found' });
            return;
        }
        if (feedback.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        await feedback.update({
            content,
            rating,
            feedbackType,
            submittedByName,
            submittedByEmail,
        });
        res.status(200).json({ message: 'Feedback updated', feedback });
    }
    catch (error) {
        console.error('Error updating feedback:', error);
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.updateFeedbackContent = updateFeedbackContent;
const deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const userId = req.user?.id;
        const feedback = await Feedback_1.Feedback.findByPk(feedbackId);
        if (!feedback) {
            res.status(404).json({ message: 'Feedback not found' });
            return;
        }
        if (feedback.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        await feedback.destroy();
        res.status(200).json({ message: 'Feedback deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.deleteFeedback = deleteFeedback;
// 2. ADMIN
const getAllFeedbacks = async (_req, res) => {
    try {
        const feedbacks = await Feedback_1.Feedback.findAll({
            order: [['created_at', 'DESC']],
            // include: ['user', 'event'],
        });
        res.status(200).json(feedbacks);
    }
    catch (error) {
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
        ;
    }
};
exports.getAllFeedbacks = getAllFeedbacks;
const updateFeedbackStatus = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        const { feedbackId } = req.params;
        const { status, isPublic, notes } = req.body;
        const feedback = await Feedback_1.Feedback.findByPk(feedbackId);
        if (!feedback) {
            res.status(404).json({ message: 'Feedback not found' });
            return;
        }
        await feedback.update({
            status,
            isPublic,
            notes,
            reviewedByUserId: reviewerId,
            reviewedAt: new Date(),
        });
        res.status(200).json({ message: 'Feedback status updated', feedback });
    }
    catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
        ;
    }
};
exports.updateFeedbackStatus = updateFeedbackStatus;
// 3. PUBLIC
const getPublicFeedbacks = async (_req, res) => {
    try {
        const feedbacks = await Feedback_1.Feedback.findAll({
            where: {
                status: Feedback_1.FeedbackStatus.APPROVED_FOR_PUBLIC,
            },
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(feedbacks);
    }
    catch (error) {
        console.error('Error fetching public feedbacks:', error);
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
        ;
    }
};
exports.getPublicFeedbacks = getPublicFeedbacks;
const getFeedbacksByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const userId = req.user?.id;
        const isValidStatus = Object.values(Feedback_1.FeedbackStatus).includes(status);
        if (!isValidStatus) {
            res.status(400).json({ message: 'Invalid feedback status' });
            return;
        }
        let whereClause = { status };
        // if (isAdmin) {
        //     // No filtering
        // } else {
        //     // Authenticated user, show their own feedbacks only
        //     whereClause.userId = userId;
        // }
        const feedbacks = await Feedback_1.Feedback.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: ['user', 'event'],
        });
        res.status(200).json(feedbacks);
    }
    catch (error) {
        res.status(400).json({
            error: 'Request failed',
            details: error.errors?.map((e) => e.message) || error.message,
        });
    }
};
exports.getFeedbacksByStatus = getFeedbacksByStatus;
