import { Merchant } from './merchant.model.js';
import { Order } from './order.model.js';

// Associations. The FK column itself is declared on the Order model; these give
// us eager-loading helpers if we need them later.
Merchant.hasMany(Order, { foreignKey: 'merchant_id' });
Order.belongsTo(Merchant, { foreignKey: 'merchant_id' });

export { Merchant, Order };
