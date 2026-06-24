const express = require('express');
const path = require('path');
require('dotenv').config();
const productsRouter = require('./src/routes/products');

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/products', productsRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});