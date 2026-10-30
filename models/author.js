const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Author = sequelize.define('Author', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING },
}, { tableName: 'authors', timestamps: true });

module.exports = Author;