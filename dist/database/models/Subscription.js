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
exports.Subscription = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
const SubscriptionPlan_1 = require("./SubscriptionPlan");
const Payment_1 = require("./Payment");
let Subscription = class Subscription extends sequelize_typescript_1.Model {
};
exports.Subscription = Subscription;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Subscription.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Subscription.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => SubscriptionPlan_1.SubscriptionPlan),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Subscription.prototype, "planId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => SubscriptionPlan_1.SubscriptionPlan),
    __metadata("design:type", SubscriptionPlan_1.SubscriptionPlan)
], Subscription.prototype, "plan", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'active', 'cancelled', 'expired', 'trialing', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Subscription.prototype, "mpesaTransactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Payment_1.Payment, 'subscriptionId'),
    __metadata("design:type", Array)
], Subscription.prototype, "payments", void 0);
exports.Subscription = Subscription = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'subscriptions',
        timestamps: true,
        underscored: true,
    })
], Subscription);
