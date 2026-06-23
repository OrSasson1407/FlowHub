import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { randomUUID } from 'crypto';
import { sequelize } from '../config/database';
import {
  taskCategories,
  TaskCategory,
  taskPriorities,
  TaskPriority,
  taskSources,
  TaskSource,
  taskStatuses,
  TaskStatus,
} from '../types/domain';

export class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare source: CreationOptional<TaskSource>;
  declare externalId: CreationOptional<string | null>;
  declare status: CreationOptional<TaskStatus>;
  declare priority: CreationOptional<TaskPriority>;
  declare categoryTag: CreationOptional<TaskCategory>;
  declare dueDate: CreationOptional<Date | null>;
  declare completedAt: CreationOptional<Date | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Task.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM(...taskSources),
      allowNull: false,
      defaultValue: 'manual',
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'external_id',
    },
    status: {
      type: DataTypes.ENUM(...taskStatuses),
      allowNull: false,
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM(...taskPriorities),
      allowNull: false,
      defaultValue: 'medium',
    },
    categoryTag: {
      type: DataTypes.ENUM(...taskCategories),
      allowNull: false,
      defaultValue: 'work',
      field: 'category_tag',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
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
    modelName: 'Task',
    tableName: 'tasks',
    underscored: true,
    indexes: [
      { fields: ['user_id', 'status'] },
      { fields: ['user_id', 'due_date'] },
      { unique: true, fields: ['user_id', 'source', 'external_id'] },
    ],
  },
);
