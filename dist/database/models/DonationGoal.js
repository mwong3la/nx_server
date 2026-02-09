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
exports.DonationOutGoal = void 0;
// DonationGoal.ts
const sequelize_typescript_1 = require("sequelize-typescript");
const Goal_1 = __importDefault(require("./Goal"));
const DonationIn_1 = __importDefault(require("./DonationIn"));
const DonationOut_1 = __importDefault(require("./DonationOut"));
let DonationInGoal = class DonationInGoal extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationInGoal.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => DonationIn_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationInGoal.prototype, "donationInId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Goal_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationInGoal.prototype, "goalId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationInGoal.prototype, "notes", void 0);
DonationInGoal = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'donation_in_goals', timestamps: true })
], DonationInGoal);
let DonationOutGoal = class DonationOutGoal extends sequelize_typescript_1.Model {
};
exports.DonationOutGoal = DonationOutGoal;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationOutGoal.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => DonationOut_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationOutGoal.prototype, "donationOutId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Goal_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], DonationOutGoal.prototype, "goalId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], DonationOutGoal.prototype, "notes", void 0);
exports.DonationOutGoal = DonationOutGoal = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'donation_out_goals', timestamps: true })
], DonationOutGoal);
exports.default = DonationInGoal;
