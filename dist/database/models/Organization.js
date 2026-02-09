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
exports.Organization = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
let Organization = class Organization extends sequelize_typescript_1.Model {
};
exports.Organization = Organization;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Organization.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Organization.prototype, "subdomain", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)('free'),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Organization.prototype, "plan", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => User_1.User),
    __metadata("design:type", Array)
], Organization.prototype, "users", void 0);
exports.Organization = Organization = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'organizations' })
], Organization);
