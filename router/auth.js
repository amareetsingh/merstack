const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken');
require("../db/conn");
const Auth = require("../middleware/Auth");
const User = require("../modal/useSchema");
const package = require("../modal/PackSchema");
const PaySchema = require("../modal/pymentSchema");
const CheckPack = require("../middleware/checkPack");
const ChatList = require("../modal/ChatList");
const ChatHistory = require("../modal/ChatHistory");

const stripe = require("stripe")(
  "sk_test_51MmypUSIVChpnvMqKRIcVKN7H2jDO7lFw12F6gDht9vibcfPg7JKFqJaDepfV0gmEosbcA4vU7TfAzEyj1shtRxy00tm9Krpdr"
);
const uuid = require("uuid").v4;

const cors = require("cors");

router.post("/register", async (req, res) => {
  const { name, email, password, cpassword, phone } = req.body;

  if (!name || !email || !password || !cpassword || !phone) {
    return res.status(422).json({ error: "plz filled the field properly" });
  }
  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    } else if (password !== cpassword) {
      return res.status(422).json({ error: "password are not matching" });
    } else {
      const customer = await stripe.customers.create(
        {
          email,
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );
      const user = new User({
        name,
        email,
        password,
        cpassword,
        phone,
        stripeCustomerId: customer.id,
      });

      const userRegister = user.save();
      res.status(201).json({ message: "user register successfuly" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "plz filled the data" });
    }

    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      const token = await userLogin.generateAuthToken();

      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 15000000),
        httpOnly: true,
      });

      if (!isMatch) {
        res.status(400).send({ error: "Invalid Credientials " });
      } else {
        res.send({ message: "user Signin Successfuly" });
      }
    } else {
      res.status(400).send({ error: "Invalid Credientials " });
    }
  } catch (err) {
    res.send({ error: err });
  }
});

router.get("/about", CheckPack, (req, res) => {
  res.send(req.PackUserFind);
});
router.get("/getUser", Auth, (req, res) => {
  res.send(req.rootUser);
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).send("user logout");
});

router.get("/packages", Auth, async (req, res) => {
  try {
    const response = await package.find();
    res.send(response);
  } catch (error) {
    res.status(400).send(error);
  }
});
router.post("/getchathistory", async (req, res) => {
  try {
  const token = req.cookies.jwtoken;

    const chathistory = await ChatHistory.findOne({
      chat_id: req.body.chat_id,
    });
    if (chathistory)  {
      res.status(200).send(chathistory);
    } else {
      res.status(422).send("chat history not found");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/getchatlist", async (req, res) => {
  try {
    const userExist = await User.findOne({ "tokens.token": req.cookies.jwtoken });
    // const token = req.cookies.jwtoken;

  const response = await ChatList.find({email:userExist.email});
    res.send(response);
  
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/checkout/:id", async (req, res) => {
  PaySchema.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        features: req.body.features,
        count_limit: req.body.count_limit,
        price: req.body.price,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        id: req.body.id,
        email: req.body.email,
        object: req.body.object,
      },
    }
  )
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500).send(error);
    });
});

router.post("/chatlist", async(req, res) => {
  const { chat_id, chat_name } = req.body;
  const userExist = await User.findOne({ "tokens.token": req.cookies.jwtoken });

  try {
    const newChatList = new ChatList({
      email:userExist.email,
      chat_id,
      chat_name,
    });

    const chatList = newChatList.save();
    res.status(200).send("new Chat list successfuly created ");
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/chathistory", (req, res) => {
  const token = req.cookies.jwtoken;

  const {
    chat_id,
    chat_name,
    response_text,
    generate_word,
    chat_max_tokens,
    chat_industry,
  } = req.body;
  try {
    const newChatHistory = new ChatHistory({
      token:token,
      chat_id,
      chat_name,
      response_text,
      generate_word,
      chat_max_tokens,
      chat_industry,
    });

    const chathistory = newChatHistory.save();
    res.status(200).send("new Chat history successfuly created ");
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/checkout", async (req, res) => {
  console.log("checkout ", req.body);

  const { item, token } = req.body;
  const Users = await User.findOne({ email: token.email });

  stripe.paymentIntents
    .create({
      payment_method_types: ["card"],
      amount: item.price, // Charging Rs 25
      description: `Purchased the package2 ${item.name}`,
      currency: "INR",
      customer: Users.stripeCustomerId,
    })
    .then((charge) => {
      const user = new PaySchema({
        email: token.email,
        name: item.name,
        price: item.price,
        features: item.features,
        package_code: token.id,
        count_limit: item.count_limit,
      });

      const userRegister = user.save();
      res.status(200).send({ user, charge });
    })
    .catch((err) => {
      res.send(err);
    });
});

module.exports = router;
