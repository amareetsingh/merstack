const bodyparser = require('body-parser')

const midcheckout = async (req, res, next) =>{
  
 bodyparser.urlencoded({extended:false})
 bodyparser.json()


};

module.exports = midcheckout;
