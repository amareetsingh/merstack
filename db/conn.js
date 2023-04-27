const mongoose = require('mongoose');
const DB = process.env.DATABASE;


mongoose.connect(DB).then(()=>{
    console.log('connection seccussful')
}).catch((err)=>{
    console.log('no connection')
    console.log('no connection', err)
})