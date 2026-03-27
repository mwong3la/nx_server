import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { User } from './User';
import { Customer } from './Customer';
import { ShipmentStatus } from './ShipmentStatus';

@Table({
  tableName: 'shipments',
  timestamps: true,
  underscored: true,
})
export class Shipment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(32))
  trackingNumber!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ShipmentStatus)),
    allowNull: false,
    defaultValue: ShipmentStatus.PENDING,
  })
  status!: ShipmentStatus;

  /** Narrative progress updates from admin (visible on public tracking). */
  @AllowNull(true)
  @Column(DataType.TEXT)
  progressNote?: string;

  /** Where the shipment is now (city, hub, country, etc.). */
  @AllowNull(true)
  @Column(DataType.STRING(500))
  currentLocation?: string;

  /** Customer this shipment belongs to (optional). One customer can have many shipments. */
  @ForeignKey(() => Customer)
  @AllowNull(true)
  @Column(DataType.UUID)
  customerId?: string | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  createdById!: string;

  @BelongsTo(() => Customer, { foreignKey: 'customerId', as: 'customer' })
  customer?: Customer | null;

  @BelongsTo(() => User, { foreignKey: 'createdById', as: 'createdBy' })
  createdBy!: User;
}
