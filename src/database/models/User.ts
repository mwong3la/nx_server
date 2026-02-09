import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  IsEmail,
  HasMany,
} from 'sequelize-typescript';
import { UserRole } from '../../types/rbac.types';
import { Vehicle } from './Vehicle';
import { Inspection } from './Inspection';
import { Subscription } from './Subscription';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Unique
  @IsEmail
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  phone?: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.USER,
  })
  role!: UserRole;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastLoginAt?: Date;

  @HasMany(() => Vehicle, 'userId')
  vehicles!: Vehicle[];

  @HasMany(() => Inspection, 'userId')
  inspections!: Inspection[];

  @HasMany(() => Subscription, 'userId')
  subscriptions!: Subscription[];
}
