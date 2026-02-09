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
exports.Feedback = exports.FeedbackStatus = exports.FeedbackType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Event_1 = __importDefault(require("./Event"));
const User_1 = require("./User");
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["EVENT_PARTICIPANT"] = "EventParticipant";
    FeedbackType["VOLUNTEER_REFLECTION"] = "VolunteerReflection";
    FeedbackType["COMMUNITY_GENERAL"] = "CommunityGeneral";
    FeedbackType["TESTIMONIAL_PROPOSAL"] = "TestimonialProposal";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["UNDER_REVIEW"] = "Under review";
    FeedbackStatus["NEEDS_FOLLOW_UP"] = "Needs follow up";
    FeedbackStatus["APPROVED_FOR_PUBLIC"] = "Approved";
    FeedbackStatus["ARCHIVED"] = "Archived";
    FeedbackStatus["REJECTED"] = "Rejected";
})(FeedbackStatus || (exports.FeedbackStatus = FeedbackStatus = {}));
let Feedback = class Feedback extends sequelize_typescript_1.Model {
};
exports.Feedback = Feedback;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Feedback.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Feedback.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default),
    __metadata("design:type", Event_1.default)
], Feedback.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Feedback.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Feedback.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Feedback.prototype, "submittedByName", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Feedback.prototype, "submittedByEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(FeedbackType))),
    __metadata("design:type", String)
], Feedback.prototype, "feedbackType", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Feedback.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Feedback.prototype, "rating", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(FeedbackStatus.UNDER_REVIEW),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(FeedbackStatus))),
    __metadata("design:type", String)
], Feedback.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Feedback.prototype, "reviewedByUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, 'reviewedByUserId'),
    __metadata("design:type", User_1.User)
], Feedback.prototype, "reviewedByUser", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Feedback.prototype, "reviewedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Feedback.prototype, "notes", void 0);
exports.Feedback = Feedback = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'feedbacks',
        timestamps: true,
    })
], Feedback);
