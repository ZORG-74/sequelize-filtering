const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('Order', {
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM('new', 'paid', 'shipped'),
    defaultValue: 'new',
  },
}, { tableName: 'orders', timestamps: true });

module.exports = Order;