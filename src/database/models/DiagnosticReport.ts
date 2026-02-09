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
import { Inspection } from './Inspection';

export type ReportFindingSeverity = 'critical' | 'monitor' | 'informational';

export interface ReportFindingShape {
  id: string;
  code?: string;
  description: string;
  severity: ReportFindingSeverity;
  system?: string;
}

export type SeverityRanking = 'critical' | 'monitor' | 'informational';

@Table({
  tableName: 'diagnostic_reports',
  timestamps: true,
  underscored: true,
})
export class DiagnosticReport extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Inspection)
  @AllowNull(false)
  @Column(DataType.UUID)
  inspectionId!: string;

  @BelongsTo(() => Inspection)
  inspection!: Inspection;

  @AllowNull(true)
  @Column(DataType.TEXT)
  summary?: string;

  @Column({
    type: DataType.ENUM('critical', 'monitor', 'informational'),
    allowNull: false,
    defaultValue: 'informational',
  })
  severityRanking!: SeverityRanking;

  @AllowNull(true)
  @Column(DataType.JSONB)
  findings?: ReportFindingShape[];

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.TEXT))
  recommendations?: string[];

  @AllowNull(true)
  @Column(DataType.STRING)
  fileUrl?: string;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  uploadedAt!: Date;
}
