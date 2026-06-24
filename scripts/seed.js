require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const categories = ["electronics", "fashion", "books", "sports", "home"];

async function seed() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_created_id
    ON products (created_at DESC, id DESC);
    `);

  await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_products_category_created_id
        ON products (category, created_at DESC, id DESC);
    `);
  const batchSize = 5000;
  const total = 200000;

  console.log("Starting seed...");

  for (let start = 0; start < total; start += batchSize) {
    const params = [];
    const rows = [];

    for (let i = 0; i < batchSize; i += 1) {
      const name = `Product ${start + i + 1}`;
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const price = (Math.random() * 1000 + 1).toFixed(2);
      const createdAt = new Date(
        Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 90,
      );
      const updatedAt = createdAt;

      params.push(name, category, price, createdAt, updatedAt);
      const offset = i * 5;
      rows.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`,
      );
    }

    await pool.query(
      `INSERT INTO products (name, category, price, created_at, updated_at) VALUES ${rows.join(",")}`,
      params,
    );

    console.log(`Inserted ${Math.min(start + batchSize, total)} products`);
  }

  await pool.end();
  console.log("Seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
