import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { Subscription } from './Subscription';

@Table({
  tableName: 'subscription_plans',
  timestamps: false,
  underscored: true,
})
export class SubscriptionPlan extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  slug!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  priceMonthly!: number;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 2))
  priceYearly?: number;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.TEXT))
  features?: string[];

  @AllowNull(true)
  @Column(DataType.INTEGER)
  inspectionLimit?: number; // null = unlimited

  @HasMany(() => Subscription, 'planId')
  subscriptions!: Subscription[];
}
