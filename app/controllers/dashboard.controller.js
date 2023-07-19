const express = require("express");
const router = express.Router();
const db = require("../models");
const auth = require("../services/authentication");
const Category = db.categorys;
const Product = db.products;
const Bill = db.bills;
require("dotenv").config();

router.get("/details", auth.authenticateToken, async (req, res) => {
  try {
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const billCount = await Bill.countDocuments();

    const data = {
      category: categoryCount,
      product: productCount,
      bill: billCount,
    };

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
