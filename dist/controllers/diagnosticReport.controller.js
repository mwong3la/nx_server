"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReport = exports.upload = exports.get = exports.list = void 0;
const DiagnosticReport_1 = require("../database/models/DiagnosticReport");
const Inspection_1 = require("../database/models/Inspection");
const rbac_types_1 = require("../types/rbac.types");
const uploadToAzure_1 = require("../utils/uploadToAzure");
function toReportShape(r) {
    return {
        id: r.id,
        inspectionId: r.inspectionId,
        inspection: r.inspection ? { id: r.inspection.id, status: r.inspection.status, vehicleId: r.inspection.vehicleId } : undefined,
        summary: r.summary ?? undefined,
        severityRanking: r.severityRanking,
        findings: r.findings ?? [],
        recommendations: r.recommendations ?? [],
        fileUrl: r.fileUrl ?? undefined,
        uploadedAt: r.uploadedAt?.toISOString?.() ?? new Date().toISOString(),
        createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: r.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
const list = async (req, res) => {
    try {
        const { vehicleId, inspectionId } = req.query;
        const where = {};
        if (inspectionId && typeof inspectionId === 'string')
            where.inspectionId = inspectionId;
        const reports = await DiagnosticReport_1.DiagnosticReport.findAll({
            where: Object.keys(where).length ? where : undefined,
            include: [{ model: Inspection_1.Inspection, as: 'inspection', attributes: ['id', 'status', 'vehicleId', 'userId'] }],
            order: [['createdAt', 'DESC']],
        });
        let filtered = reports;
        if (vehicleId && typeof vehicleId === 'string') {
            filtered = reports.filter((r) => r.inspection?.vehicleId === vehicleId);
        }
        // Non-admin: only own inspection reports
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && req.user?.id) {
            filtered = filtered.filter((r) => r.inspection?.userId === req.user?.id);
        }
        res.json(filtered.map((r) => toReportShape(r)));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.list = list;
const get = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await DiagnosticReport_1.DiagnosticReport.findByPk(id, {
            include: [{ model: Inspection_1.Inspection, as: 'inspection' }],
        });
        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }
        const insp = report.inspection;
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && insp?.userId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        res.json(toReportShape(report));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.get = get;
const upload = async (req, res) => {
    try {
        const inspectionId = req.params.inspectionId || req.params.id;
        const inspection = await Inspection_1.Inspection.findByPk(inspectionId);
        if (!inspection) {
            res.status(404).json({ message: 'Inspection not found' });
            return;
        }
        if (inspection.technicianId !== req.user?.id && req.userRole !== rbac_types_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only assigned technician can upload report' });
            return;
        }
        let fileUrl;
        const file = req.file;
        if (file) {
            try {
                fileUrl = await (0, uploadToAzure_1.uploadBufferToAzure)(file);
            }
            catch (e) {
                console.warn('Azure upload failed, saving report without file:', e);
            }
        }
        const { summary, severityRanking, findings, recommendations } = req.body;
        let findingsArr = findings;
        let recommendationsArr = recommendations;
        if (typeof findings === 'string')
            try {
                findingsArr = JSON.parse(findings);
            }
            catch {
                findingsArr = [];
            }
        if (typeof recommendations === 'string')
            try {
                recommendationsArr = JSON.parse(recommendations);
            }
            catch {
                recommendationsArr = [];
            }
        const report = await DiagnosticReport_1.DiagnosticReport.create({
            inspectionId,
            summary: summary || null,
            severityRanking: severityRanking || 'informational',
            findings: findingsArr ?? [],
            recommendations: recommendationsArr ?? [],
            fileUrl: fileUrl || null,
            uploadedAt: new Date(),
        });
        await inspection.update({ reportId: report.id });
        const withInsp = await DiagnosticReport_1.DiagnosticReport.findByPk(report.id, { include: [{ model: Inspection_1.Inspection, as: 'inspection' }] });
        res.status(201).json(toReportShape(withInsp));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.upload = upload;
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { summary, severityRanking, findings, recommendations } = req.body;
        const report = await DiagnosticReport_1.DiagnosticReport.findByPk(id, {
            include: [{ model: Inspection_1.Inspection, as: 'inspection' }],
        });
        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }
        const insp = report.inspection;
        if (req.userRole !== rbac_types_1.UserRole.ADMIN && insp?.technicianId !== req.user?.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await report.update({
            ...(summary !== undefined && { summary }),
            ...(severityRanking !== undefined && { severityRanking }),
            ...(findings !== undefined && { findings: Array.isArray(findings) ? findings : report.findings }),
            ...(recommendations !== undefined && { recommendations: Array.isArray(recommendations) ? recommendations : report.recommendations }),
        });
        const updated = await DiagnosticReport_1.DiagnosticReport.findByPk(id, { include: [{ model: Inspection_1.Inspection, as: 'inspection' }] });
        res.json(toReportShape(updated));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateReport = updateReport;
