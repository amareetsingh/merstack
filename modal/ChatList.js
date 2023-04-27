const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const chatList = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    chat_id:{
        type:String,
        required:true
    },
    chat_name:{
        type:String,
        required:true
    }
   
});

const ChatList = mongoose.model('CHATLIST', chatList);

module.exports = ChatList;