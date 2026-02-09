import { Response } from 'express';
import { Op } from 'sequelize';
import { DiagnosticReport } from '../database/models/DiagnosticReport';
import { Inspection } from '../database/models/Inspection';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../types/rbac.types';
import { uploadBufferToAzure } from '../utils/uploadToAzure';

function toReportShape(r: DiagnosticReport & { inspection?: Inspection }) {
  return {
    id: r.id,
    inspectionId: r.inspectionId,
    inspection: r.inspection ? { id: r.inspection.id, status: r.inspection.status, vehicleId: r.inspection.vehicleId } : undefined,
    summary: r.summary ?? undefined,
    severityRanking: r.severityRanking,
    findings: r.findings ?? [],
    recommendations: r.recommendations ?? [],
    fileUrl: r.fileUrl ?? undefined,
    uploadedAt: (r as any).uploadedAt?.toISOString?.() ?? new Date().toISOString(),
    createdAt: (r as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (r as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export const list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vehicleId, inspectionId } = req.query;
    const where: Record<string, string> = {};
    if (inspectionId && typeof inspectionId === 'string') where.inspectionId = inspectionId;

    const reports = await DiagnosticReport.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [{ model: Inspection, as: 'inspection', attributes: ['id', 'status', 'vehicleId', 'userId'] }],
      order: [['createdAt', 'DESC']],
    });

    let filtered = reports;
    if (vehicleId && typeof vehicleId === 'string') {
      filtered = reports.filter((r) => (r as any).inspection?.vehicleId === vehicleId);
    }

    // Non-admin: only own inspection reports
    if (req.userRole !== UserRole.ADMIN && req.user?.id) {
      filtered = filtered.filter((r) => (r as any).inspection?.userId === req.user?.id);
    }

    res.json(filtered.map((r) => toReportShape(r as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const get = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const report = await DiagnosticReport.findByPk(id, {
      include: [{ model: Inspection, as: 'inspection' }],
    });
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    const insp = (report as any).inspection;
    if (req.userRole !== UserRole.ADMIN && insp?.userId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    res.json(toReportShape(report as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const upload = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspectionId = req.params.inspectionId || req.params.id;
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      res.status(404).json({ message: 'Inspection not found' });
      return;
    }
    if (inspection.technicianId !== req.user?.id && req.userRole !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only assigned technician can upload report' });
      return;
    }

    let fileUrl: string | undefined;
    const file = req.file as Express.Multer.File | undefined;
    if (file) {
      try {
        fileUrl = await uploadBufferToAzure(file);
      } catch (e) {
        console.warn('Azure upload failed, saving report without file:', e);
      }
    }

    const { summary, severityRanking, findings, recommendations } = req.body;
    let findingsArr = findings;
    let recommendationsArr = recommendations;
    if (typeof findings === 'string') try { findingsArr = JSON.parse(findings); } catch { findingsArr = []; }
    if (typeof recommendations === 'string') try { recommendationsArr = JSON.parse(recommendations); } catch { recommendationsArr = []; }

    const report = await DiagnosticReport.create({
      inspectionId,
      summary: summary || null,
      severityRanking: severityRanking || 'informational',
      findings: findingsArr ?? [],
      recommendations: recommendationsArr ?? [],
      fileUrl: fileUrl || null,
      uploadedAt: new Date(),
    });

    await inspection.update({ reportId: report.id });
    const withInsp = await DiagnosticReport.findByPk(report.id, { include: [{ model: Inspection, as: 'inspection' }] });
    res.status(201).json(toReportShape(withInsp as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { summary, severityRanking, findings, recommendations } = req.body;
    const report = await DiagnosticReport.findByPk(id, {
      include: [{ model: Inspection, as: 'inspection' }],
    });
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    const insp = (report as any).inspection;
    if (req.userRole !== UserRole.ADMIN && insp?.technicianId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    await report.update({
      ...(summary !== undefined && { summary }),
      ...(severityRanking !== undefined && { severityRanking }),
      ...(findings !== undefined && { findings: Array.isArray(findings) ? findings : report.findings }),
      ...(recommendations !== undefined && { recommendations: Array.isArray(recommendations) ? recommendations : report.recommendations }),
    });
    const updated = await DiagnosticReport.findByPk(id, { include: [{ model: Inspection, as: 'inspection' }] });
    res.json(toReportShape(updated as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
