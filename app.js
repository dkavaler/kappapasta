var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
require('dotenv').config();

var app = express();

app.set('views', path.join(__dirname, 'www/views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'www')));
app.use(bodyParser.urlencoded({ extended : true }));

/* Logger */
app.use('/', require('./routes/logger'));

/* Browser routes */
app.use('/', require('./routes/www'));

app.listen(process.env.SERVER_PORT);
