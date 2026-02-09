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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const KPI_1 = __importDefault(require("./KPI"));
const DonationIn_1 = __importDefault(require("./DonationIn"));
const DonationGoal_1 = __importStar(require("./DonationGoal"));
const DonationOut_1 = __importDefault(require("./DonationOut"));
const Event_1 = __importDefault(require("./Event"));
const Organization_1 = require("./Organization");
const Theme_1 = __importDefault(require("./Theme"));
let Goal = class Goal extends sequelize_typescript_1.Model {
    // Hooks for computed fields and status
    static initializeHooks() {
        this.beforeSave(async (goal) => {
            const [kpis, events, donationsIn, donationsOut] = await Promise.all([
                KPI_1.default.findAll({ where: { goalId: goal.id } }),
                Event_1.default.findAll({ where: { goalId: goal.id } }),
                goal.$get('donationsIn'),
                goal.$get('donationsOut'),
            ]);
            const totalProgress = kpis.reduce((sum, kpi) => sum + (Number(kpi.progress) || 0), 0);
            goal.progress = totalProgress;
            goal.progressPercentage = goal.targetAmount ? (totalProgress / goal.targetAmount) * 100 : 0;
            goal.successRate = Math.min(Math.max(goal.progressPercentage, 0), 100);
            goal.progressPercentage = goal.successRate;
            const now = new Date();
            const timeRemainingMonths = (goal.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
            const hasKeyResources = events.length > 0 || donationsIn.length > 0 || donationsOut.length > 0;
            if (goal.progressPercentage >= 100) {
                goal.status = 'Achieved';
            }
            else if (!hasKeyResources) {
                goal.status = 'Not Started';
            }
            else if (goal.progressPercentage < 25 && !hasKeyResources) {
                goal.status = 'At Risk';
            }
            else if (events.length < 5 && timeRemainingMonths < 2) {
                goal.status = 'Started (High Risk)';
            }
            else if (events.length < 5 && timeRemainingMonths >= 6) {
                goal.status = 'Started (Low Risk)';
            }
            else {
                goal.status = 'Started (Low Risk)';
            }
        });
    }
    get timeProgress() {
        const now = new Date();
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const elapsed = now.getTime() - start.getTime();
        const total = end.getTime() - start.getTime();
        return total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0;
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Goal.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Goal.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Goal.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Organization_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Goal.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Organization_1.Organization),
    __metadata("design:type", Organization_1.Organization)
], Goal.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Theme_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Goal.prototype, "themeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Theme_1.default),
    __metadata("design:type", Theme_1.default)
], Goal.prototype, "theme", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Goal.prototype, "region", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: false,
        validate: { min: 0 },
    }),
    __metadata("design:type", Number)
], Goal.prototype, "targetAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Goal.prototype, "progress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Goal.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                const startDate = this.startDate;
                if (new Date(value) <= new Date(startDate)) {
                    throw new Error('endDate must be after startDate');
                }
            },
        },
    }),
    __metadata("design:type", Date)
], Goal.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Not Started', 'Started (Low Risk)', 'Started (High Risk)', 'At Risk', 'Achieved'),
        allowNull: false,
        defaultValue: 'Not Started',
    }),
    __metadata("design:type", String)
], Goal.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Goal.prototype, "progressPercentage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Goal.prototype, "successRate", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => KPI_1.default),
    __metadata("design:type", Array)
], Goal.prototype, "kpis", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Event_1.default),
    __metadata("design:type", Array)
], Goal.prototype, "events", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => DonationIn_1.default, () => DonationGoal_1.default),
    __metadata("design:type", Array)
], Goal.prototype, "donationsIn", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => DonationOut_1.default, () => DonationGoal_1.DonationOutGoal),
    __metadata("design:type", Array)
], Goal.prototype, "donationsOut", void 0);
Goal = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'goals',
        timestamps: true,
        indexes: [{ fields: ['status'] }]
    })
], Goal);
exports.default = Goal;
