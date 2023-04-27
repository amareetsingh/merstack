const jwt = require("jsonwebtoken");
const User = require('../modal/useSchema');
const pymentSchema = require('../modal/pymentSchema')

const CheckPack = async (req, res, next) =>{
    try{
        const { authorization } = req.headers;
        const token= req.cookies.jwtoken;

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

        const rootUser=await User.findOne({id:verifyToken._id,"tokens.token":token});
        const UserEmail = rootUser.email;
        const PackUserFind = await pymentSchema.findOne({email:UserEmail});

        if (!PackUserFind){
            throw new Error('User not found ')
        }

        // if(!rootUser){throw new Error("user not found")}
        req.token=token;
        req.PackUserFind=PackUserFind;
        // req.userID=rootUser._id;
        next();
    }catch(err){
        res.status(401).send("no token found");
        console.log(err);
    }

};

module.exports = CheckPack;