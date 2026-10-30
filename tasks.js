const { Op } = require('sequelize');
const {
  sequelize,
  User, Post,
  Author, Book,
  Student, Course, Enrollment,
  Order, Item,
} = require('./models');

/* =========================================================
   ЗАДАНИЕ 1. Пользователи с постами после 2023-01-01
   where внутри include фильтрует посты по дате;
   required: true (INNER JOIN) — только те, у кого есть >=1 пост;
   order: [name ASC, [Post] publishedAt DESC] — двухуровневая сортировка.
   ========================================================= */
async function task1() {
  return User.findAll({
    include: [{
      model: Post,
      as: 'posts',
      where: { publishedAt: { [Op.gt]: '2023-01-01' } },
      required: true,
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'publishedAt', 'DESC'],
    ],
  });
}

/* =========================================================
   ЗАДАНИЕ 2. Все авторы, включая тех, у кого нет книг
   required: false → LEFT OUTER JOIN;
   у «пустых» авторов books будет [] (пустой массив);
   order только по родителю — lastName ASC.
   ========================================================= */
async function task2() {
  return Author.findAll({
    include: [{
      model: Book,
      as: 'books',
      required: false,
    }],
    order: [['lastName', 'ASC']],
  });
}

/* =========================================================
   ЗАДАНИЕ 3. Студенты, записанные хотя бы на один курс с credits > 3
   N:M: required: true на уровне Course отсеивает студентов
   без подходящих курсов;
   through: { attributes: [] } скрывает поля Enrollment;
   order двухуровневый — студент по name, курсы по title.
   ========================================================= */
async function task3() {
  return Student.findAll({
    include: [{
      model: Course,
      as: 'courses',
      where: { credits: { [Op.gt]: 3 } },
      required: true,
      through: { attributes: [] },
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Course, as: 'courses' }, 'title', 'ASC'],
    ],
  });
}

/* =========================================================
   ЗАДАНИЕ 4. Заказы с хотя бы одним товаром quantity > 2
   where внутри include отсеивает товары quantity <= 2;
   required: true → только заказы с такими товарами;
   order: заказы по createdAt DESC, товары по price DESC.
   ========================================================= */
async function task4() {
  return Order.findAll({
    include: [{
      model: Item,
      as: 'items',
      where: { quantity: { [Op.gt]: 2 } },
      required: true,
    }],
    order: [
      ['createdAt', 'DESC'],
      [{ model: Item, as: 'items' }, 'price', 'DESC'],
    ],
  });
}

/* =========================================================
   ЗАДАНИЕ 5. Активные пользователи с >=1 опубликованным постом
   Фильтр на родителя → верхнеуровневый where;
   фильтр на связанную модель → include.where;
   order: name ASC, посты createdAt DESC.
   ========================================================= */
async function task5() {
  return User.findAll({
    where: { isActive: true },
    include: [{
      model: Post,
      as: 'posts',
      where: { status: 'published' },
      required: true,
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'createdAt', 'DESC'],
    ],
  });
}

/* ================== ТЕСТОВЫЕ ДАННЫЕ ================== */
async function seed() {
  // Пользователи: у 'Eve' нет постов, 'Dave' неактивен
  const [alice, bob, dave, eve] = await User.bulkCreate([
    { name: 'Alice', email: 'alice@example.com', isActive: true  },
    { name: 'Bob',   email: 'bob@example.com',   isActive: true  },
    { name: 'Dave',  email: 'dave@example.com',  isActive: false },
    { name: 'Eve',   email: 'eve@example.com',   isActive: true  },
  ], { returning: true });

  await Post.bulkCreate([
    { title: 'Alice 2022', authorId: alice.id, publishedAt: '2022-05-01', status: 'published' },
    { title: 'Alice 2023', authorId: alice.id, publishedAt: '2023-06-01', status: 'published' },
    { title: 'Alice 2024 draft', authorId: alice.id, publishedAt: '2024-02-01', status: 'draft' },
    { title: 'Bob 2023',   authorId: bob.id,   publishedAt: '2023-09-10', status: 'published' },
    { title: 'Dave 2024',  authorId: dave.id,  publishedAt: '2024-03-01', status: 'published' },
    // у Eve постов нет
  ]);

  // Авторы: у Tolkien книги, у Orwell — ни одной, у Rowling — одна
  const [tolkien, orwell, rowling] = await Author.bulkCreate([
    { firstName: 'John',  lastName: 'Tolkien',  country: 'UK' },
    { firstName: 'George', lastName: 'Orwell',  country: 'UK' }, // без книг
    { firstName: 'Joanne', lastName: 'Rowling', country: 'UK' },
  ], { returning: true });

  await Book.bulkCreate([
    { title: 'The Hobbit',   year: 1937, genre: 'Fantasy', authorId: tolkien.id },
    { title: 'The Silmarillion', year: 1977, genre: 'Fantasy', authorId: tolkien.id },
    { title: "Harry Potter and the Philosopher's Stone", year: 1997, genre: 'Fantasy', authorId: rowling.id },
  ]);

  // Курсы: 2 студента, курсы с разной кредитностью
  const [ann, ben] = await Student.bulkCreate([
    { name: 'Ann', group: 'A-101' },
    { name: 'Ben', group: 'B-202' },
  ], { returning: true });

  const [math, physics, art] = await Course.bulkCreate([
    { title: 'Mathematics', credits: 5 },
    { title: 'Physics',     credits: 4 },
    { title: 'Art',         credits: 2 },
  ], { returning: true });

  // Ann — на Mathematics (5) и Art (2); Ben — только на Art (2)
  await Enrollment.bulkCreate([
    { StudentId: ann.id, CourseId: math.id, grade: 5 },
    { StudentId: ann.id, CourseId: art.id,  grade: 4 },
    { StudentId: ben.id, CourseId: art.id,  grade: 3 },
  ]);

  // Заказы: в одном есть товар quantity > 2, в другом — нет
  const [order1, order2] = await Order.bulkCreate([
    { number: 'ORD-001', status: 'paid' },
    { number: 'ORD-002', status: 'new'  },
  ], { returning: true });

  await Item.bulkCreate([
    { productName: 'Laptop',   quantity: 1, price: 90000, orderId: order1.id },
    { productName: 'Mouse',    quantity: 5, price: 1500,  orderId: order1.id },
    { productName: 'Keyboard', quantity: 3, price: 3500,  orderId: order1.id },
    { productName: 'Monitor',  quantity: 1, price: 25000, orderId: order2.id },
    { productName: 'Cable',    quantity: 2, price: 500,   orderId: order2.id },
  ]);
}

/* ================== ЗАПУСК ================== */
async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к SQLite установлено');

    await sequelize.sync({ force: true });
    console.log('✅ Таблицы синхронизированы');

    await seed();
    console.log('✅ Тестовые данные добавлены\n');

    // --- Задание 1 ---
    console.log('═══ Задание 1. Пользователи с постами после 2023-01-01 ═══');
    const r1 = await task1();
    r1.forEach(u => {
      console.log(`👤 ${u.name}:`);
      u.posts.forEach(p => console.log(`   • ${p.title} (${p.publishedAt.toISOString().slice(0,10)})`));
    });

    // --- Задание 2 ---
    console.log('\n═══ Задание 2. Все авторы (включая без книг) ═══');
    const r2 = await task2();
    r2.forEach(a => {
      const booksStr = a.books.length
        ? a.books.map(b => b.title).join(', ')
        : '— нет книг —';
      console.log(`👤 ${a.lastName} ${a.firstName}: ${booksStr}`);
    });

    // --- Задание 3 ---
    console.log('\n═══ Задание 3. Студенты на курсах с credits > 3 ═══');
    const r3 = await task3();
    r3.forEach(s => {
      console.log(`🎓 ${s.name} (${s.group}):`);
      s.courses.forEach(c => console.log(`   • ${c.title} (${c.credits} кр.)`));
    });

    // --- Задание 4 ---
    console.log('\n═══ Задание 4. Заказы с товарами quantity > 2 ═══');
    const r4 = await task4();
    r4.forEach(o => {
      console.log(`📦 ${o.number} [${o.status}] (${o.createdAt.toISOString().slice(0,10)}):`);
      o.items.forEach(i => console.log(`   • ${i.productName} × ${i.quantity} — ${i.price} ₽`));
    });

    // --- Задание 5 ---
    console.log('\n═══ Задание 5. Активные пользователи с published-постами ═══');
    const r5 = await task5();
    r5.forEach(u => {
      console.log(`👤 ${u.name}:`);
      u.posts.forEach(p => console.log(`   • ${p.title} [${p.status}]`));
    });

  } catch (err) {
    console.error('❌ Ошибка:', err);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Соединение закрыто');
  }
}

main();