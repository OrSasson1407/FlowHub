import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { randomUUID } from 'crypto';
import { sequelize } from '../config/database';
import { integrationProviders, IntegrationProvider } from '../types/domain';

export class Integration extends Model<
  InferAttributes<Integration>,
  InferCreationAttributes<Integration>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare provider: IntegrationProvider;
  declare accessToken: CreationOptional<string | null>;
  declare refreshToken: CreationOptional<string | null>;
  declare tokenExpiresAt: CreationOptional<Date | null>;
  declare isActive: CreationOptional<boolean>;
  declare configuredAt: CreationOptional<Date>;
  declare lastSyncedAt: CreationOptional<Date | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Integration.init(
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
    provider: {
      type: DataTypes.ENUM(...integrationProviders),
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'access_token',
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token',
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'token_expires_at',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    configuredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'configured_at',
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_synced_at',
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
    modelName: 'Integration',
    tableName: 'integrations',
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'provider'] }],
  },
);
