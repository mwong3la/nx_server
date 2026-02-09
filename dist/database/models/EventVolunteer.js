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
exports.EventVolunteer = exports.VolunteerStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
// import { User } from './User'; 
const Event_1 = __importDefault(require("./Event"));
const User_1 = require("./User");
var VolunteerStatus;
(function (VolunteerStatus) {
    VolunteerStatus["PENDING"] = "Pending";
    VolunteerStatus["APPROVED"] = "Approved";
    VolunteerStatus["REJECTED"] = "Rejected";
    VolunteerStatus["ATTENDED"] = "Attended";
    VolunteerStatus["COMPLETED"] = "Completed";
    VolunteerStatus["CANCELLED_BY_VOLUNTEER"] = "CancelledByVolunteer";
    VolunteerStatus["CANCELLED_BY_NGO"] = "CancelledByNgo";
    VolunteerStatus["NO_SHOW"] = "NoShow";
})(VolunteerStatus || (exports.VolunteerStatus = VolunteerStatus = {}));
let EventVolunteer = class EventVolunteer extends sequelize_typescript_1.Model {
};
exports.EventVolunteer = EventVolunteer;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], EventVolunteer.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], EventVolunteer.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default),
    __metadata("design:type", Event_1.default)
], EventVolunteer.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], EventVolunteer.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], EventVolunteer.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(VolunteerStatus.PENDING),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(VolunteerStatus))),
    __metadata("design:type", String)
], EventVolunteer.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(5, 2)),
    __metadata("design:type", Number)
], EventVolunteer.prototype, "hoursServed", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], EventVolunteer.prototype, "tasksPerformed", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], EventVolunteer.prototype, "feedback", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], EventVolunteer.prototype, "notes", void 0);
exports.EventVolunteer = EventVolunteer = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'event_volunteers',
        timestamps: true,
    })
], EventVolunteer);
