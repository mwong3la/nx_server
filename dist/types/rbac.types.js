"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.UserRole = void 0;
/**
 * Nexbridge: only staff (admin) accounts authenticate. Customers are separate records without login.
 */
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["READ_ADMIN"] = "read_admin";
    Permission["CREATE_ADMIN"] = "create_admin";
    Permission["READ_CUSTOMER"] = "read_customer";
    Permission["CREATE_CUSTOMER"] = "create_customer";
    Permission["UPDATE_CUSTOMER"] = "update_customer";
    Permission["READ_SHIPMENT"] = "read_shipment";
    Permission["CREATE_SHIPMENT"] = "create_shipment";
    Permission["UPDATE_SHIPMENT"] = "update_shipment";
    Permission["DELETE_SHIPMENT"] = "delete_shipment";
})(Permission || (exports.Permission = Permission = {}));
