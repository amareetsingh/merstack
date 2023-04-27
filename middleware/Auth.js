const jwt = require("jsonwebtoken");
const User = require('../modal/useSchema');

const Auth = async (req, res, next) =>{
    try{
        const { authorization } = req.headers;
        const token= req.cookies.jwtoken;

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

        const rootUser=await User.findOne({id:verifyToken._id,"tokens.token":token});

        if(!rootUser){throw new Error("user not found")}
        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id;
        next();
    }catch(err){
        res.status(401).send("no token found");
        console.log(err);
    }

};

module.exports = Auth;

