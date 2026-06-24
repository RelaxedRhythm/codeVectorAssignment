const express = require('express');
const router = express.Router();
const pool = require('../db');

//decode cursor
const parseCursor = (cursor) => {
  if (!cursor) return null;

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [createdAt, id] = decoded.split('|');
    return { createdAt, id: Number(id) };
  } catch {
    return null;
  }
};
//encode cursor
const createCursor = (row) => {
  if (!row) return null;
  return Buffer.from(`${row.created_at.toISOString()}|${row.id}`).toString('base64');
};

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const category = req.query.category;
    const cursor = parseCursor(req.query.cursor);
    if (req.query.cursor && !cursor) {
    return res.status(400).json({
        error: 'Invalid cursor'
    });
}

    const values = [limit + 1];
    const where = [];

    if (category) {
      values.push(category);
      where.push(`category = $${values.length}`);
    }

    if (cursor) {
      values.push(cursor.createdAt, cursor.id);
      where.push(`(created_at, id) < ($${values.length - 1}::timestamp, $${values.length}::int)`);
    }

    const query = `
      SELECT id, name, category, price, created_at, updated_at
      FROM products
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `;

    const result = await pool.query(query, values);
    const rows = result.rows;
    const hasNext = rows.length > limit;
    const pageRows = hasNext ? rows.slice(0, limit) : rows;
    const nextCursor = hasNext ? createCursor(pageRows[pageRows.length - 1]) : null;

    res.json({
      data: pageRows,
      next_cursor: nextCursor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;