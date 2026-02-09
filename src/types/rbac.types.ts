/**
 * Coltium-Auto: roles and permissions
 */
export enum UserRole {
  USER = 'user',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum Permission {
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  CREATE_USER = 'create_user',
  DELETE_USER = 'delete_user',
  READ_VEHICLE = 'read_vehicle',
  CREATE_VEHICLE = 'create_vehicle',
  UPDATE_VEHICLE = 'update_vehicle',
  DELETE_VEHICLE = 'delete_vehicle',
  READ_INSPECTION = 'read_inspection',
  CREATE_INSPECTION = 'create_inspection',
  UPDATE_INSPECTION = 'update_inspection',
  ASSIGN_INSPECTION = 'assign_inspection',
  READ_REPORT = 'read_report',
  CREATE_REPORT = 'create_report',
  UPDATE_REPORT = 'update_report',
  READ_SUBSCRIPTION = 'read_subscription',
  MANAGE_TECHNICIANS = 'manage_technicians',
}

export interface RolePermissions {
  [UserRole.USER]: Permission[];
  [UserRole.TECHNICIAN]: Permission[];
  [UserRole.ADMIN]: Permission[];
}
