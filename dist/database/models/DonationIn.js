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
exports.DonationType = exports.DonationStatus = exports.DonationSource = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Goal_1 = __importDefault(require("./Goal"));
const Event_1 = __importDefault(require("./Event"));
const DonationGoal_1 = __importDefault(require("./DonationGoal"));
const Organization_1 = require("./Organization");
// import User from './User';
var DonationSource;
(function (DonationSource) {
    DonationSource["INDIVIDUAL"] = "Individual";
    DonationSource["INSTITUTIONAL"] = "Institutional";
    DonationSource["GRANT"] = "Grant";
    DonationSource["CORPORATE"] = "Corporate";
    DonationSource["GOVERNMENT"] = "Government";
    DonationSource["OTHER"] = "Other";
})(DonationSource || (exports.DonationSource = DonationSource = {}));
var DonationStatus;
(function (DonationStatus) {
    DonationStatus["PENDING"] = "PENDING";
    DonationStatus["RECEIVED"] = "RECEIVED";
    DonationStatus["CANCELLED"] = "CANCELLED";
    DonationStatus["COMPLETED"] = "COMPLETED";
    DonationStatus["FAILED"] = "FAILED";
    DonationStatus["REFUNDED"] = "REFUNDED";
})(DonationStatus || (exports.DonationStatus = DonationStatus = {}));
var DonationType;
(function (DonationType) {
    DonationType["CASH"] = "CASH";
    DonationType["CREDIT_CARD"] = "CREDIT_CARD";
    DonationType["BANK_TRANSFER"] = "BANK_TRANSFER";
    DonationType["CHECK"] = "CHECK";
    DonationType["CRYPTO"] = "CRYPTO";
    DonationType["IN_KIND"] = "IN_KIND";
    DonationType["OTHER"] = "OTHER";
})(DonationType || (exports.DonationType = DonationType = {}));
let DonationIn = class DonationIn extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationIn.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    }),
    __metadata("design:type", Number)
], DonationIn.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
    }),
    __metadata("design:type", String)
], DonationIn.prototype, "currency", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationIn.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationSource)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationIn.prototype, "source", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationIn.prototype, "purpose", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DonationIn.prototype, "donorName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    }),
    __metadata("design:type", Object)
], DonationIn.prototype, "donorEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationIn.prototype, "donorPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationIn.prototype, "receiptUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationStatus)),
        allowNull: false,
        defaultValue: DonationStatus.PENDING,
    }),
    __metadata("design:type", String)
], DonationIn.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], DonationIn.prototype, "isAnonymous", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationIn.prototype, "receivedDate", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Goal_1.default, () => DonationGoal_1.default),
    __metadata("design:type", Array)
], DonationIn.prototype, "goals", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", Object)
], DonationIn.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default),
    __metadata("design:type", Event_1.default)
], DonationIn.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], DonationIn.prototype, "isRecurring", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationIn.prototype, "recurringFrequency", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationIn.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Organization_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationIn.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Organization_1.Organization),
    __metadata("design:type", Organization_1.Organization)
], DonationIn.prototype, "organization", void 0);
DonationIn = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'donations_in', timestamps: true, indexes: [{ fields: ['status'] }] })
], DonationIn);
exports.default = DonationIn;
