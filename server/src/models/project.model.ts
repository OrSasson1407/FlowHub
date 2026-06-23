import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { randomUUID } from 'crypto';
import { sequelize } from '../config/database';

export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare name: string;
  declare code: CreationOptional<string>;
  declare description: CreationOptional<string | null>;
  declare progress: CreationOptional<number>;
  declare color: CreationOptional<string>;
  declare milestones: CreationOptional<string[]>;
  declare team: CreationOptional<string[]>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Project.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => randomUUID(),
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'PROJ',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    color: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: '#2563EB',
    },
    milestones: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    team: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    underscored: true,
    indexes: [{ fields: ['user_id'] }],
  },
);
