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

  await pool.query(`
  INSERT INTO products (
    name,
    category,
    price,
    created_at,
    updated_at
  )
  SELECT
      'Product ' || gs,
      (ARRAY['electronics','fashion','books','sports','home'])
          [floor(random() * 5 + 1)],
      round((random() * 1000 + 1)::numeric, 2),
      NOW() - (random() * interval '90 days'),
      NOW() - (random() * interval '90 days')
  FROM generate_series(1, 200000) gs
`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
