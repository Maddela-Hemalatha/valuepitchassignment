const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const useragent = require('express-useragent');
const config = require('./config');
const path = require('path');

const app = express();

if(config.env === 'development') {
    app.use(morgan('dev'));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

app.use(cookieParser());
app.use(useragent.express());

app.use('/', require('../routes/user'));
app.use('/api/v1', require('../routes/person'));

app.use(express.static(path.join(__dirname+'/uploads')));


app.get('*', (req, res, next) => {
    if(app.get('env') === 'development'){
        res.sendFile(path.join(__dirname, '../../src/index.html'));
    }
});

module.exports = app;