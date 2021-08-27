const express = require('express');
const app = express();
require('dotenv/config');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors()); // * = entire  http requests

// Routes
const productsRouter = require('./routers/products');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');
const categoriesRouter = require('./routers/categories');

const api = process.env.API_URL;
// Middlewares
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/categories`, categoriesRouter);

// Database connection
mongoose
  .connect(process.env.MONGODB_CONNECTION, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Connected to db server');
  })
  .catch((err) => console.error(err));

//Server
app.listen('3000', () => {
  console.log('server is running 3000');
});

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  console.log('server is listening on port' + port);
});

// mongoose settings
mongoose.set('useFindAndModify', false);
