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
  HasOne,
} from 'sequelize-typescript';
import { User } from './User';
import { Vehicle } from './Vehicle';
import { DiagnosticReport } from './DiagnosticReport';

export enum InspectionStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'inspections',
  timestamps: true,
  underscored: true,
})
export class Inspection extends Model {
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

  @ForeignKey(() => Vehicle)
  @AllowNull(false)
  @Column(DataType.UUID)
  vehicleId!: string;

  @BelongsTo(() => Vehicle)
  vehicle!: Vehicle;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  technicianId?: string;

  @BelongsTo(() => User, 'technicianId')
  technician?: User;

  @Column({
    type: DataType.ENUM(...Object.values(InspectionStatus)),
    allowNull: false,
    defaultValue: InspectionStatus.PENDING,
  })
  status!: InspectionStatus;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  requestedAt!: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  scheduledAt?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  startedAt?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  completedAt?: Date;

  @AllowNull(true)
  @Column(DataType.TEXT)
  notes?: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  reportId?: string;

  @HasOne(() => DiagnosticReport, 'inspectionId')
  report?: DiagnosticReport;
}
