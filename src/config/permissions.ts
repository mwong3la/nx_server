import { UserRole, Permission, RolePermissions } from '../types/rbac.types';

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [...Object.values(Permission)],
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] ?? [];
};
