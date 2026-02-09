"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controllers_1 = require("../controllers/feedback.controllers");
const feedbackRouter = (0, express_1.Router)();
// 1. Private
// feedbackRouter.post('/', submitFeedback);
feedbackRouter.get('/my', feedback_controllers_1.getMyFeedback);
feedbackRouter.get('/public', feedback_controllers_1.getPublicFeedbacks);
feedbackRouter.get('/all', feedback_controllers_1.getAllFeedbacks);
feedbackRouter.put('/:feedbackId', feedback_controllers_1.updateFeedbackContent);
feedbackRouter.delete('/:feedbackId', feedback_controllers_1.deleteFeedback);
feedbackRouter.get('/:status', feedback_controllers_1.getFeedbacksByStatus);
feedbackRouter.patch('/:feedbackId', feedback_controllers_1.updateFeedbackStatus);
exports.default = feedbackRouter;
