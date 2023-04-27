const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require("uuid");
const PackSchema = new mongoose.Schema({
  features: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },

  count_limit: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  
  package_code: {
    type: String,
    required: false,
  },
});



const package = mongoose.model("PACKAGE", PackSchema);
const createDocument = async () => {
  try {
    const pack = new package({
      name: "package-1",
      features: "This is Testing Package 1",
      count_limit: 100,
      price: 100,
      package_code:"package1",
    });
    const newpack = new package({
      name: "package-2",
      features: "This is Testing Package 2",
      count_limit: 200,
      price: 200,
      package_code: 'package2',
    });
    const result = await package.insertMany([pack, newpack]);
    console.log("results", result);
  } catch (error) {}
};
createDocument();
module.exports = package;
