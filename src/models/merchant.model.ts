import {
  DataTypes,
  Model,
  literal,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db.js';

/** Merchant (tenant) model. Mirrors the original `merchants` table exactly. */
export class Merchant extends Model<InferAttributes<Merchant>, InferCreationAttributes<Merchant>> {
  declare id: string;
  declare name: string;
  declare created_at: CreationOptional<string>;
}

Merchant.init(
  {
    id: { type: DataTypes.TEXT, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.TEXT, allowNull: false, defaultValue: literal('CURRENT_TIMESTAMP') },
  },
  {
    sequelize,
    tableName: 'merchants',
    timestamps: false,
  },
);
