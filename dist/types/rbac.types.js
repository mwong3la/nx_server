"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.UserRole = void 0;
/**
 * Coltium-Auto: roles and permissions
 */
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["TECHNICIAN"] = "technician";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["READ_USER"] = "read_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["CREATE_USER"] = "create_user";
    Permission["DELETE_USER"] = "delete_user";
    Permission["READ_VEHICLE"] = "read_vehicle";
    Permission["CREATE_VEHICLE"] = "create_vehicle";
    Permission["UPDATE_VEHICLE"] = "update_vehicle";
    Permission["DELETE_VEHICLE"] = "delete_vehicle";
    Permission["READ_INSPECTION"] = "read_inspection";
    Permission["CREATE_INSPECTION"] = "create_inspection";
    Permission["UPDATE_INSPECTION"] = "update_inspection";
    Permission["ASSIGN_INSPECTION"] = "assign_inspection";
    Permission["READ_REPORT"] = "read_report";
    Permission["CREATE_REPORT"] = "create_report";
    Permission["UPDATE_REPORT"] = "update_report";
    Permission["READ_SUBSCRIPTION"] = "read_subscription";
    Permission["MANAGE_TECHNICIANS"] = "manage_technicians";
})(Permission || (exports.Permission = Permission = {}));
