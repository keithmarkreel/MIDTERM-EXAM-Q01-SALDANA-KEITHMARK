const express = require('express');
const fs = require('fs');
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
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  let rows = '';
  for (const product of products) {
    const name = String(product.product_name).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    const category = String(product.category).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    const status = product.stock === 0 ? 'OUT OF STOCK' : product.stock <= 5 ? 'LOW STOCK' : 'AVAILABLE';
    rows += `<tr><td>${product.id}</td><td>${name}</td><td>${category}</td><td>${product.price}</td><td>${product.stock}</td><td>${status}</td><td><form action="/products/${product.id}/delete" method="post"><button>Delete</button></form></td></tr>`;
  }

  const message = req.query.message === 'added' ? 'Product added' : req.query.message === 'deleted' ? 'Product deleted' : '';
  const page = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  res.send(page.replace('{{products}}', rows).replace('{{message}}', message));
});

app.post('/products', (req, res) => {
  const { product_name, category, price, stock } = req.body;
  products.push({
    id: nextProductId++,
    product_name: product_name.trim(),
    category: category.trim(),
    price: Number(price),
    stock: Number(stock)
  });
  res.redirect('/?message=added');
});

app.post('/products/:id/delete', (req, res) => {
  const index = products.findIndex((product) => product.id === Number(req.params.id));
  if (index !== -1) products.splice(index, 1);
  res.redirect('/?message=deleted');
});

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