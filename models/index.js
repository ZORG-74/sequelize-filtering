const sequelize = require('../db');

const User = require('./user');
const Post = require('./post');
const Author = require('./author');
const Book = require('./book');
const Student = require('./student');
const Course = require('./course');
const Enrollment = require('./enrollment');
const Order = require('./order');
const Item = require('./item');

// 1:N — User → Post
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// 1:N — Author → Book
Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

// N:M — Student ↔ Course через Enrollment
Student.belongsToMany(Course, { through: Enrollment, as: 'courses' });
Course.belongsToMany(Student, { through: Enrollment, as: 'students' });

// 1:N — Order → Item
Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
Item.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  User, Post,
  Author, Book,
  Student, Course, Enrollment,
  Order, Item,
};