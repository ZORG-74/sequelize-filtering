const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Enrollment = sequelize.define('Enrollment', {
  enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  grade: { type: DataTypes.INTEGER },
}, { tableName: 'enrollments', timestamps: true });

module.exports = Enrollment;