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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticReport = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Inspection_1 = require("./Inspection");
let DiagnosticReport = class DiagnosticReport extends sequelize_typescript_1.Model {
};
exports.DiagnosticReport = DiagnosticReport;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DiagnosticReport.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Inspection_1.Inspection),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DiagnosticReport.prototype, "inspectionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Inspection_1.Inspection),
    __metadata("design:type", Inspection_1.Inspection)
], DiagnosticReport.prototype, "inspection", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], DiagnosticReport.prototype, "summary", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('critical', 'monitor', 'informational'),
        allowNull: false,
        defaultValue: 'informational',
    }),
    __metadata("design:type", String)
], DiagnosticReport.prototype, "severityRanking", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    __metadata("design:type", Array)
], DiagnosticReport.prototype, "findings", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.TEXT)),
    __metadata("design:type", Array)
], DiagnosticReport.prototype, "recommendations", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DiagnosticReport.prototype, "fileUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], DiagnosticReport.prototype, "uploadedAt", void 0);
exports.DiagnosticReport = DiagnosticReport = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'diagnostic_reports',
        timestamps: true,
        underscored: true,
    })
], DiagnosticReport);
