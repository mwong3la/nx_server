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
exports.Inspection = exports.InspectionStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
const Vehicle_1 = require("./Vehicle");
const DiagnosticReport_1 = require("./DiagnosticReport");
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["PENDING"] = "pending";
    InspectionStatus["ASSIGNED"] = "assigned";
    InspectionStatus["IN_PROGRESS"] = "in_progress";
    InspectionStatus["COMPLETED"] = "completed";
    InspectionStatus["CANCELLED"] = "cancelled";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
let Inspection = class Inspection extends sequelize_typescript_1.Model {
};
exports.Inspection = Inspection;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Inspection.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Inspection.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Inspection.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Vehicle_1.Vehicle),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Inspection.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Vehicle_1.Vehicle),
    __metadata("design:type", Vehicle_1.Vehicle)
], Inspection.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Inspection.prototype, "technicianId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, 'technicianId'),
    __metadata("design:type", User_1.User)
], Inspection.prototype, "technician", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(InspectionStatus)),
        allowNull: false,
        defaultValue: InspectionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Inspection.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Inspection.prototype, "requestedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Inspection.prototype, "scheduledAt", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Inspection.prototype, "startedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Inspection.prototype, "completedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Inspection.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Inspection.prototype, "reportId", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => DiagnosticReport_1.DiagnosticReport, 'inspectionId'),
    __metadata("design:type", DiagnosticReport_1.DiagnosticReport)
], Inspection.prototype, "report", void 0);
exports.Inspection = Inspection = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'inspections',
        timestamps: true,
        underscored: true,
    })
], Inspection);
