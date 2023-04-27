const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyparser = require('body-parser');
const cors = require('cors');
const {createProxyMiddleware} = require('http-proxy-middleware');


const app = express();

app.use(cors());

// app.use(function(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
 
dotenv.config({path:'./config.env'})
const port = process.env.PORT || 5000;
app.use(cookieParser());
require('./db/conn');
app.use(express.json());
app.use(require('./router/auth'));


if(process.env.NODE_ENV == "production"){
    app.use(express.static("openai/build"));
}

app.listen(port, ()=>{
    console.log('serve is running ')
})