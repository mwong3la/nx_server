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
  HasMany,
} from 'sequelize-typescript';
import { User } from './User';
import { SubscriptionPlan } from './SubscriptionPlan';
import { Payment } from './Payment';

export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'expired' | 'trialing' | 'failed';

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
})
export class Subscription extends Model {
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

  @ForeignKey(() => SubscriptionPlan)
  @AllowNull(false)
  @Column(DataType.UUID)
  planId!: string;

  @BelongsTo(() => SubscriptionPlan)
  plan!: SubscriptionPlan;

  @Column({
    type: DataType.ENUM('pending', 'active', 'cancelled', 'expired', 'trialing', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status!: SubscriptionStatus;

  @AllowNull(false)
  @Column(DataType.DATE)
  currentPeriodEnd!: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  mpesaTransactionId?: string;

  @HasMany(() => Payment, 'subscriptionId')
  payments!: Payment[];
}
