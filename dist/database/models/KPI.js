"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Goal_1 = __importDefault(require("./Goal"));
const Organization_1 = require("./Organization");
let KPI = class KPI extends sequelize_typescript_1.Model {
    // Hooks for computed fields and status
    static initializeHooks() {
        this.beforeSave(async (kpi) => {
            // Calculate successRate
            kpi.successRate = kpi.target ? (kpi.progress / kpi.target) * 100 : 0;
            kpi.successRate = Math.min(Math.max(kpi.successRate, 0), 100);
            // Calculate timeProgress (uses Goal's dates)
            // const goal = await Goal.findByPk(kpi.goalId);
            // if (goal) {
            //   const currentDate = new Date();
            //   const startDate = new Date(goal.startDate);
            //   const endDate = new Date(goal.endDate);
            //   const timeElapsed = currentDate.getTime() - startDate.getTime();
            //   const totalTime = endDate.getTime() - startDate.getTime();
            //   kpi.timeProgress = totalTime > 0 ? (timeElapsed / totalTime) * 100 : 0;
            //   kpi.timeProgress = Math.min(Math.max(kpi.timeProgress, 0), 100);
            // }
            // Calculate status
            if (kpi.progress === 0) {
                kpi.status = 'Not Started';
            }
            else if (kpi.progress >= kpi.target) {
                kpi.status = 'Achieved';
            }
            else {
                kpi.status = 'In Progress';
            }
        });
    }
    get timeProgress() {
        if (!this.goal) {
            throw new Error('Goal must be loaded to compute timeProgress');
        }
        const now = new Date();
        const start = new Date(this.goal.startDate);
        const end = new Date(this.goal.endDate);
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
], KPI.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], KPI.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], KPI.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Goal_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], KPI.prototype, "goalId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Goal_1.default),
    __metadata("design:type", Goal_1.default)
], KPI.prototype, "goal", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Organization_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], KPI.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Organization_1.Organization),
    __metadata("design:type", Organization_1.Organization)
], KPI.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: false,
        validate: { min: 0 },
    }),
    __metadata("design:type", Number)
], KPI.prototype, "target", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    }),
    __metadata("design:type", Number)
], KPI.prototype, "progress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], KPI.prototype, "successRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Not Started', 'In Progress', 'Achieved'),
        allowNull: false,
        defaultValue: 'Not Started',
    }),
    __metadata("design:type", String)
], KPI.prototype, "status", void 0);
KPI = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'kpis', timestamps: true })
], KPI);
exports.default = KPI;
