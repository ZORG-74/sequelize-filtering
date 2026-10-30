const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Post = sequelize.define('Post', {
  title: { type: DataTypes.STRING, allowNull: false },
  publishedAt: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
}, { tableName: 'posts', timestamps: true });

module.exports = Post;