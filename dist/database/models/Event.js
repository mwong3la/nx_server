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
exports.EventStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Goal_1 = __importDefault(require("./Goal"));
const DonationIn_1 = __importDefault(require("./DonationIn"));
const Feedback_1 = require("./Feedback");
const User_1 = require("./User");
const Organization_1 = require("./Organization");
const Volunteer_1 = require("./Volunteer");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "Draft";
    EventStatus["SUBMITTED"] = "Submitted";
    EventStatus["APPROVED"] = "Approved";
    EventStatus["COMPLETED"] = "Completed";
    EventStatus["CANCELLED"] = "Cancelled";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
// export enum EventCategory {
//     TREE_PLANTING = 'Tree Planting',
//     TOURNAMENT = 'Tournament',
//     HEALTH_OUTREACH = 'Health',
//     EDUCATION = 'Education',
//     FUNDRAISING = 'Fundraising',
//     COMMUNITY_MEETING = 'Community Meeting',
//     OTHER = 'Other'
// }
let Event = class Event extends sequelize_typescript_1.Model {
    // Calculate progress based on outcomes and actual participants vs expected
    get progress() {
        if (this.status === EventStatus.COMPLETED) {
            return 100;
        }
        else if (this.status === EventStatus.CANCELLED) {
            return 0;
        }
        else if (this.status === EventStatus.APPROVED || this.status === EventStatus.SUBMITTED) {
            return 50;
        }
        else {
            return 25;
        }
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Event.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(EventStatus)),
        allowNull: false,
        defaultValue: EventStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Event.prototype, "startDate", void 0);
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
], Event.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Goal_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Event.prototype, "goalId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Goal_1.default),
    __metadata("design:type", Goal_1.default)
], Event.prototype, "goal", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true, // TODO: Change to true later
    }),
    __metadata("design:type", String)
], Event.prototype, "createdById", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Event.prototype, "creator", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Event.prototype, "expectedParticipants", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    }),
    __metadata("design:type", Number)
], Event.prototype, "actualParticipants", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Event.prototype, "budget", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Event.prototype, "outcomes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Event.prototype, "mediaUrls", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DonationIn_1.default),
    __metadata("design:type", Array)
], Event.prototype, "donations", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Volunteer_1.Volunteer),
    __metadata("design:type", Array)
], Event.prototype, "volunteerAssignments", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Volunteer_1.Volunteer),
    __metadata("design:type", Array)
], Event.prototype, "volunteers", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Feedback_1.Feedback),
    __metadata("design:type", Array)
], Event.prototype, "feedbacks", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Organization_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Event.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Organization_1.Organization),
    __metadata("design:type", Organization_1.Organization)
], Event.prototype, "organization", void 0);
Event = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'events', timestamps: true, indexes: [{ fields: ['status'] }] })
], Event);
exports.default = Event;
