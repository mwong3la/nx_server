"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controllers_1 = require("../controllers/event.controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_types_1 = require("../types/rbac.types");
const upload_1 = require("../middlewares/upload");
const eventsRouter = (0, express_1.Router)();
eventsRouter.get("/", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_EVENT), event_controllers_1.getEvents);
eventsRouter.post("/", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.CREATE_EVENT), event_controllers_1.createEvent);
eventsRouter.get("/:id", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_EVENT), event_controllers_1.getEventById);
eventsRouter.post("/upload/:eventId/:type", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.CREATE_EVENT), upload_1.upload.single('file'), event_controllers_1.uploadHandler);
eventsRouter.put("/:id", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_EVENT), event_controllers_1.updateEvent);
eventsRouter.put("/:id", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_EVENT), event_controllers_1.updateEvent);
eventsRouter.delete("/:id", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.DELETE_EVENT), event_controllers_1.deleteEvent);
// Partners, Volunteers, Participabts
eventsRouter.get('/:eventId/volunteers', event_controllers_1.getVolunteersByEvent);
eventsRouter.get('/:eventId/participants', event_controllers_1.getParticipantsByEvent);
eventsRouter.get('/:eventId/partners', event_controllers_1.getPartnersByEvent);
eventsRouter.delete('/event-users/:type/:id', event_controllers_1.deleteEventUser);
// Media
eventsRouter.get("/:id/media", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_EVENT), event_controllers_1.getMediaByEvent);
eventsRouter.post("/:id/media", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.CREATE_EVENT), upload_1.upload.array('files[]'), event_controllers_1.uploadMedia);
eventsRouter.delete("/media/:id", (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.DELETE_EVENT), event_controllers_1.deleteMedia);
exports.default = eventsRouter;
