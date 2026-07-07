import {
  DataTypes,
  Model,
  literal,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db.js';
import { Merchant } from './merchant.model.js';

/**
 * Order model. Attribute names stay snake_case so the JSON contract and the
 * on-disk schema are byte-for-byte the same as the pre-ORM version.
 */
export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: string;
  declare merchant_id: string;
  declare customer_email: string;
  declare total_amount: number;
  declare type: 'sale' | 'refund';
  declare status: CreationOptional<string>;
  declare created_at: CreationOptional<string>;
}

Order.init(
  {
    id: { type: DataTypes.TEXT, primaryKey: true },
    merchant_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      references: { model: Merchant, key: 'id' },
    },
    customer_email: { type: DataTypes.TEXT, allowNull: false },
    total_amount: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'sale' },
    status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'completed' },
    created_at: { type: DataTypes.TEXT, allowNull: false, defaultValue: literal('CURRENT_TIMESTAMP') },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: false,
    indexes: [
      { name: 'idx_orders_merchant', fields: ['merchant_id'] },
      { name: 'idx_orders_created', fields: ['created_at'] },
    ],
  },
);
