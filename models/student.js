const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Student = sequelize.define('Student', {
  name: { type: DataTypes.STRING, allowNull: false },
  group: { type: DataTypes.STRING },
}, { tableName: 'students', timestamps: true });

module.exports = Student;