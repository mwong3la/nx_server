import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';

/**
 * Recipient / party associated with shipments — no password, no site login.
 * Admin creates these records and assigns one or more shipments per customer.
 */
@Table({
  tableName: 'customers',
  timestamps: true,
  underscored: true,
})
export class Customer extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  email?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  phone?: string;
}
