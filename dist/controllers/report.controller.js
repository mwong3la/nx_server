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
exports.getGoalReport = void 0;
const sequelize_1 = require("sequelize");
const Goal_1 = __importDefault(require("../database/models/Goal"));
const KPI_1 = __importDefault(require("../database/models/KPI"));
const Event_1 = __importDefault(require("../database/models/Event"));
const DonationIn_1 = __importStar(require("../database/models/DonationIn"));
const Theme_1 = __importDefault(require("../database/models/Theme"));
const DonationOut_1 = __importStar(require("../database/models/DonationOut"));
const getGoalReport = async (req, res) => {
    try {
        const { region, startDate, endDate } = req.query;
        const whereClause = {};
        whereClause.organizationId = req.user.organizationId;
        if (region)
            whereClause.region = region;
        if (startDate || endDate) {
            whereClause.startDate = {};
            if (startDate)
                whereClause.startDate[sequelize_1.Op.gte] = new Date(startDate);
            if (endDate)
                whereClause.startDate[sequelize_1.Op.lte] = new Date(endDate);
        }
        const goals = await Goal_1.default.findAll({
            where: whereClause,
            include: [
                { model: KPI_1.default },
                { model: Event_1.default },
                { model: DonationIn_1.default },
                { model: DonationOut_1.default },
                { model: Theme_1.default } // <-- Include Theme
            ]
        });
        const totalGoals = goals.length;
        const sum = (arr) => arr.reduce((a, b) => a + b, 0);
        const avg = (arr) => arr.length ? sum(arr) / arr.length : 0;
        const progressArr = goals.map(g => Number(g.progressPercentage));
        const successRateArr = goals.map(g => Number(g.successRate));
        const timeProgressArr = goals.map(g => Number(g.timeProgress));
        const averageProgress = avg(progressArr);
        const averageSuccessRate = avg(successRateArr);
        const averageTimeProgress = avg(timeProgressArr);
        const statusBreakdown = {};
        for (const g of goals) {
            statusBreakdown[g.status] = (statusBreakdown[g.status] || 0) + 1;
        }
        const regionMap = {};
        for (const g of goals) {
            const region = g.region;
            if (!regionMap[region])
                regionMap[region] = { count: 0, totalProgress: 0 };
            regionMap[region].count += 1;
            regionMap[region].totalProgress += Number(g.progressPercentage);
        }
        const regionBreakdown = Object.entries(regionMap).map(([region, data]) => ({
            region,
            goalCount: data.count,
            averageProgress: data.totalProgress / data.count,
        }));
        const atRiskGoals = goals
            .filter(g => g.timeProgress - g.progressPercentage >= 25)
            .map(g => ({
            id: g.id,
            title: g.title,
            progressPercentage: Number(g.progressPercentage),
            timeProgress: Number(g.timeProgress),
            status: g.status,
        }));
        const allKpis = goals.flatMap(g => g.kpis ?? []);
        const totalKpis = allKpis.length;
        const kpiSuccessArr = allKpis.map(k => Number(k.successRate));
        const kpiTimeArr = goals.map(g => g.timeProgress);
        const kpiStatusBreakdown = {};
        for (const k of allKpis) {
            kpiStatusBreakdown[k.status] = (kpiStatusBreakdown[k.status] || 0) + 1;
        }
        const kpiSummary = {
            totalKpis,
            averageKpiSuccessRate: avg(kpiSuccessArr),
            averageKpiTimeProgress: avg(kpiTimeArr),
            statusBreakdown: kpiStatusBreakdown,
        };
        const allEvents = goals.flatMap(g => g.events ?? []);
        const totalEvents = allEvents.length;
        let totalDonationIn = 0;
        let totalDonationOut = 0;
        let completedDonationIn = 0;
        let completedDonationOut = 0;
        for (const g of goals) {
            totalDonationIn += g.donationsIn?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
            totalDonationOut += g.donationsOut?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
            completedDonationIn += g.donationsIn?.filter(d => d.status === DonationIn_1.DonationStatus.COMPLETED)
                .reduce((sum, d) => sum + Number(d.amount), 0) || 0;
            completedDonationOut += g.donationsOut?.filter(d => d.status === DonationOut_1.DonationOutStatus.COMPLETED)
                .reduce((sum, d) => sum + Number(d.amount), 0) || 0;
        }
        const donationSummary = {
            totalDonationIn: completedDonationIn,
            totalDonationOut: completedDonationOut,
            netFlow: completedDonationIn - completedDonationOut,
        };
        // Theme summary
        const themeMap = {};
        for (const g of goals) {
            const theme = g.theme?.name;
            if (theme) {
                themeMap[theme] = (themeMap[theme] || 0) + 1;
            }
        }
        const themeSummary = Object.entries(themeMap).map(([theme, count]) => ({
            theme,
            goalCount: count,
        }));
        // Final report
        res.json({
            totalGoals,
            averageProgress,
            averageSuccessRate,
            averageTimeProgress,
            statusBreakdown,
            regionBreakdown,
            atRiskGoals,
            kpiSummary,
            totalEvents,
            donationSummary,
            themeSummary, // <-- Included in response
        });
    }
    catch (error) {
        console.error('Error generating full goal report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getGoalReport = getGoalReport;
