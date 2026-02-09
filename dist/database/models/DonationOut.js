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
exports.DonationOutType = exports.DonationOutStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Goal_1 = __importDefault(require("./Goal"));
const Event_1 = __importDefault(require("./Event"));
const DonationGoal_1 = require("./DonationGoal");
const Organization_1 = require("./Organization");
// import User from './User';
var DonationOutStatus;
(function (DonationOutStatus) {
    DonationOutStatus["DISBURSED"] = "DISBURSED";
    DonationOutStatus["PENDING"] = "PENDING";
    DonationOutStatus["COMPLETED"] = "COMPLETED";
    DonationOutStatus["CANCELLED"] = "CANCELLED";
})(DonationOutStatus || (exports.DonationOutStatus = DonationOutStatus = {}));
var DonationOutType;
(function (DonationOutType) {
    DonationOutType["CASH"] = "CASH";
    DonationOutType["CREDIT_CARD"] = "CREDIT_CARD";
    DonationOutType["BANK_TRANSFER"] = "BANK_TRANSFER";
    DonationOutType["CHECK"] = "CHECK";
    DonationOutType["CRYPTO"] = "CRYPTO";
    DonationOutType["IN_KIND"] = "IN_KIND";
    DonationOutType["OTHER"] = "OTHER";
})(DonationOutType || (exports.DonationOutType = DonationOutType = {}));
let DonationOut = class DonationOut extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationOut.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    }),
    __metadata("design:type", Number)
], DonationOut.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
    }),
    __metadata("design:type", String)
], DonationOut.prototype, "currency", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationOutType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationOut.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "itemDetails", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationOut.prototype, "purpose", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "beneficiaryType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationOut.prototype, "beneficiaryName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "beneficiaryEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "beneficiaryPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "receiptUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationOut.prototype, "region", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationOutStatus)),
        allowNull: false,
        defaultValue: DonationOutStatus.PENDING,
    }),
    __metadata("design:type", String)
], DonationOut.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "disbursementDate", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Goal_1.default, () => DonationGoal_1.DonationOutGoal),
    __metadata("design:type", Array)
], DonationOut.prototype, "goals", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", Object)
], DonationOut.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default),
    __metadata("design:type", Event_1.default)
], DonationOut.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOut.prototype, "impactMetrics", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Organization_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationOut.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Organization_1.Organization),
    __metadata("design:type", Organization_1.Organization)
], DonationOut.prototype, "organization", void 0);
DonationOut = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'donations_out', timestamps: true, indexes: [{ fields: ['status'] }] })
], DonationOut);
exports.default = DonationOut;
