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
} from 'sequelize-typescript';
import { User } from './User';
import { Subscription } from './Subscription';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Table({
  tableName: 'payments',
  timestamps: true,
  underscored: true,
})
export class Payment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Subscription)
  @AllowNull(true)
  @Column(DataType.UUID)
  subscriptionId?: string;

  @BelongsTo(() => Subscription)
  subscription?: Subscription;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  amount!: number;

  @Column({
    type: DataType.ENUM('mpesa'),
    allowNull: false,
    defaultValue: 'mpesa',
  })
  method!: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @AllowNull(true)
  @Column(DataType.STRING)
  mpesaCheckoutRequestId?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  mpesaTransactionId?: string;

  @AllowNull(true)
  @Column(DataType.JSONB)
  metadata?: Record<string, unknown>;

  get transactionId(): string | undefined {
    return this.mpesaTransactionId;
  }
}
