# Sequelize: фильтрация и сортировка связанных данных

Практическая работа: `where` внутри `include`, `required: true/false`,
многоуровневый `order`.

## Предметные области и модели

| Связь | Модели | Тип |
|---|---|---|
| Пользователи ↔ Посты | `User` — `Post` | 1:N (`hasMany`/`belongsTo`) |
| Авторы ↔ Книги | `Author` — `Book` | 1:N |
| Студенты ↔ Курсы | `Student` — `Course` через `Enrollment` | N:M |
| Заказы ↔ Товары | `Order` — `Item` | 1:N |

## Реализованные задания

1. **Пользователи с постами после 2023-01-01.** `include.where` по `publishedAt`
   + `required: true` (INNER JOIN) + `order` по `name ASC` и `posts.publishedAt DESC`.
2. **Все авторы, включая без книг.** `required: false` → LEFT OUTER JOIN; у «пустых»
   `books` = `[]`; сортировка по `lastName ASC`.
3. **Студенты с курсами `credits > 3`.** N:M: `include.where` по `Course.credits`,
   `required: true`, `through: { attributes: [] }` — скрывает поля Enrollment.
4. **Заказы с товарами `quantity > 2`.** `include.where` отсеивает «мелкие» товары,
   `required: true` — только заказы с такими товарами; `order` по
   `createdAt DESC` и `items.price DESC`.
5. **Активные пользователи с published-постами.** Верхнеуровневый `where`
   (isActive) + `include.where` (status='published') + `required: true`.

## Ключевые механизмы

- **`include.where`** добавляется в `ON`-часть JOIN и фильтрует связанные записи
  до присоединения к родителю.
- **`required: true`** превращает `LEFT JOIN` в `INNER JOIN` — родители без
  подходящих детей отсеиваются.
- **`required: false`** — поведение по умолчанию для `include` без `where`,
  оставляет всех «родителей».
- **Многоуровневый `order`** — `[{ model, as }, 'field', 'DIR']` сортирует
  связанные записи внутри каждого родителя; псевдоним `as` обязан совпадать
  с тем, что был указан в `include`.

## Запуск

```bash
npm install
node tasks.js