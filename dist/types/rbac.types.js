"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["PROGRAM_MANAGER"] = "program_manager";
    UserRole["VOLUNTEER"] = "volunteer";
    UserRole["DONOR"] = "donor";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    // Goals
    Permission["CREATE_GOAL"] = "create_goal";
    Permission["READ_GOAL"] = "read_goal";
    Permission["UPDATE_GOAL"] = "update_goal";
    Permission["DELETE_GOAL"] = "delete_goal";
    // Kpis
    Permission["CREATE_KPI"] = "create_kpi";
    Permission["READ_KPI"] = "read_kpi";
    Permission["UPDATE_KPI"] = "update_kpi";
    Permission["DELETE_KPI"] = "delete_kpi";
    // Events
    Permission["CREATE_EVENT"] = "create_event";
    Permission["READ_EVENT"] = "read_event";
    Permission["UPDATE_EVENT"] = "update_event";
    Permission["DELETE_EVENT"] = "delete_event";
    Permission["APPROVE_EVENT"] = "approve_event";
    // Donations
    Permission["CREATE_DONATION"] = "create_donation";
    Permission["READ_DONATION"] = "read_donation";
    Permission["UPDATE_DONATION"] = "update_donation";
    Permission["DELETE_DONATION"] = "delete_donation";
    // Volunteers
    Permission["CREATE_VOLUNTEER"] = "create_volunteer";
    Permission["READ_VOLUNTEER"] = "read_volunteer";
    Permission["UPDATE_VOLUNTEER"] = "update_volunteer";
    Permission["DELETE_VOLUNTEER"] = "delete_volunteer";
    Permission["ASSIGN_VOLUNTEER"] = "assign_volunteer";
    // Feedback & Testimonials
    Permission["CREATE_FEEDBACK"] = "create_feedback";
    Permission["READ_FEEDBACK"] = "read_feedback";
    Permission["UPDATE_FEEDBACK"] = "update_feedback";
    Permission["DELETE_FEEDBACK"] = "delete_feedback";
    Permission["APPROVE_TESTIMONIAL"] = "approve_testimonial";
    // Reports
    Permission["CREATE_REPORT"] = "create_report";
    Permission["READ_REPORT"] = "read_report";
    Permission["READ_ALL_REPORTS"] = "read_all_reports";
    // User Management
    Permission["CREATE_USER"] = "create_user";
    Permission["READ_USER"] = "read_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    // System
    Permission["READ_AUDIT_LOGS"] = "read_audit_logs";
    Permission["MANAGE_SYSTEM"] = "manage_system";
})(Permission || (exports.Permission = Permission = {}));
