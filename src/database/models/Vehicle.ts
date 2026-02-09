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
import { Inspection } from './Inspection';

@Table({
  tableName: 'vehicles',
  timestamps: true,
  underscored: true,
})
export class Vehicle extends Model {
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

  @AllowNull(false)
  @Column(DataType.STRING)
  make!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  model!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  year!: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  vin?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  registrationNumber?: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  mileage?: number;

  @AllowNull(true)
  @Column(DataType.ENUM('km', 'mi'))
  mileageUnit?: 'km' | 'mi';

  @HasMany(() => Inspection, 'vehicleId')
  inspections!: Inspection[];
}
