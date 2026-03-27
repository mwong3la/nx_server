/**
 * Nexbridge: only staff (admin) accounts authenticate. Customers are separate records without login.
 */
export enum UserRole {
  ADMIN = 'admin',
}

export enum Permission {
  READ_ADMIN = 'read_admin',
  CREATE_ADMIN = 'create_admin',
  READ_CUSTOMER = 'read_customer',
  CREATE_CUSTOMER = 'create_customer',
  UPDATE_CUSTOMER = 'update_customer',
  READ_SHIPMENT = 'read_shipment',
  CREATE_SHIPMENT = 'create_shipment',
  UPDATE_SHIPMENT = 'update_shipment',
  DELETE_SHIPMENT = 'delete_shipment',
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
}
