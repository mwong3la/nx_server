"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donationIn_controller_1 = require("../controllers/donations/donationIn.controller");
const donationOut_controller_1 = require("../controllers/donations/donationOut.controller");
const rbac_types_1 = require("../types/rbac.types");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../middlewares/upload");
const donationsRouter = (0, express_1.Router)();
;
// Donation Inflow Routes
donationsRouter.post('/in', upload_1.upload.single('file'), (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.CREATE_DONATION), donationIn_controller_1.createDonationIn);
donationsRouter.get('/in', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_DONATION), donationIn_controller_1.getAllDonationsIn);
// donationsRouter.get('/in/statistics',  DonationInController.getStatistics);
donationsRouter.get('/in/:id', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_DONATION), donationIn_controller_1.getDonationInById);
donationsRouter.put('/in/:id', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_DONATION), upload_1.upload.single('file'), donationIn_controller_1.updateDonationIn);
donationsRouter.delete('/in/:id', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.DELETE_DONATION), donationIn_controller_1.deleteDonationIn);
// donationsRouter.patch('/in/:id/status',  DonationInController.updateStatus);
// // Donation Outflow Routes
donationsRouter.post('/out', upload_1.upload.single('file'), (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.CREATE_DONATION), donationOut_controller_1.createDonationOut);
donationsRouter.get('/out', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_DONATION), donationOut_controller_1.getAllDonationsOut);
// donationsRouter.get('/out/statistics',  DonationOutController.getStatistics);
donationsRouter.get('/out/:id', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.READ_DONATION), donationOut_controller_1.getDonationOutById);
donationsRouter.put('/out/:id', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.UPDATE_DONATION), upload_1.upload.single('file'), donationOut_controller_1.updateDonationOut);
donationsRouter.delete('/out/:id', (0, auth_middleware_1.requirePermission)(rbac_types_1.Permission.DELETE_DONATION), donationOut_controller_1.deleteDonationOut);
// donationsRouter.patch('/out/:id/status',  DonationOutController.updateStatus);
exports.default = donationsRouter;
