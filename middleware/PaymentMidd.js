const jwt = require("jsonwebtoken");
const User = require('../modal/useSchema');

const PaymentMidd = async (req, res, next) =>{
    try{
        const { authorization } = req.headers;
        const token= req.cookies.jwtoken;


        const rootUser=await User.findOne({"tokens.token":token});
console.log('rooooooooo', rootUser)
        if(!rootUser){throw new Error("user not found")}
        // req.token=token;
        req.rootUser=rootUser;
        // req.userID=rootUser._id;
        next();
    }catch(err){
        res.status(401).send("no token found");
        console.log(err);
    }

};

module.exports = PaymentMidd;