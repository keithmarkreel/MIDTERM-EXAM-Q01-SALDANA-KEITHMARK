const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const products = [
  { id: 1, product_name: 'Chicken Chimchuri Burger', category: 'Food', price: 94, stock: 100 },
  { id: 2, product_name: 'Beef shawarma Burger', category: 'Food', price: 95, stock: 5 },
  { id: 3, product_name: 'Minute Burger', category: 'Food', price: 47, stock: 0 }
];
let nextProductId = 4;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (req, res) => {
  const productsWithStatus = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    let stockStatus = 'AVAILABLE';

    if (product.stock === 0) {
      stockStatus = 'OUT OF STOCK';
    } else if (product.stock <= 5) {
      stockStatus = 'LOW STOCK';
    }

    productsWithStatus.push({
      id: product.id,
      product_name: product.product_name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      stock_status: stockStatus
    });
  }

  res.json(productsWithStatus);
});

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((item) => item.id === id);

  let stockStatus = 'AVAILABLE';
  if (product.stock === 0) {
    stockStatus = 'OUT OF STOCK';
  } else if (product.stock <= 5) {
    stockStatus = 'LOW STOCK';
  }

  res.json({
    id: product.id,
    product_name: product.product_name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    stock_status: stockStatus
  });
});

app.post('/api/products', (req, res) => {
  const { product_name, category, price, stock } = req.body || {};
  const productPrice = Number(price);
  const productStock = Number(stock);


  const product = {
    id: nextProductId,
    product_name: String(product_name).trim(),
    category: String(category).trim(),
    price: productPrice,
    stock: productStock
  };

  products.push(product);
  nextProductId += 1;

  let stockStatus = 'AVAILABLE';
  if (product.stock === 0) {
    stockStatus = 'OUT OF STOCK';
  } else if (product.stock <= 5) {
    stockStatus = 'LOW STOCK';
  }

  res.status(201).json({ ...product, stock_status: stockStatus });
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex((product) => product.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products.splice(index, 1);
  res.json({ message: 'Product deleted' });
});

app.listen(port, () => {
  console.log(`Server running http://localhost:${port}`);
});