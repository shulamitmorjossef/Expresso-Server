import express from 'express';
import cors from 'cors';
import pool from './data-access/db.js';
import terms from './routs/terms.js';
import about from './routs/about.js';
import users from './routs/users.js';
import products from './routs/products.js';
import coupons from './routs/coupons.js';
import deliveryDates from './routs/delivery_dates.js';
import orders from './routs/orders.js';
import shoppingCart from './routs/shopping_cart.js';
import statistics from './routs/statistics.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());


app.use(terms);
app.use(about);
app.use(users);
app.use(products);
app.use(coupons);
app.use(deliveryDates);
app.use(orders);
app.use(shoppingCart);
app.use(statistics);






app.get('/', (req, res) => {
  res.send('Hello from Expresso!');
});


app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.send('pong 8');
  console.log('Sent pong response');
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


