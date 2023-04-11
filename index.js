require('dotenv').config();
const express = require('express');
var app = express();
const port = 8188;

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

var auth = require('./model/v1/auth/route');

app.use('/',require('./middleware/middleware').validateApiKey);
app.use('/',require('./middleware/middleware').validateUserToken);

app.use('/api/v1/auth',auth);

try{
    app.listen(process.env.PORT);
    console.log('app listing on port : 8188');
}catch{
    console.log('connection fails');
}