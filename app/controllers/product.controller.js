const db = require("../models");
const express = require("express");
const router = express.Router();
const Product = db.products;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post(
  "/add",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res) => {
    try {
      const product = req.body;

      const newProduct = new Product({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price,
        status: "true",
      });

      await newProduct.save();

      return res.status(200).json({ message: "Product added successfully" });
    } catch (error) {
      console.log(error);

      return res.status(500).json(error);
    }
  }
);

router.get("/get", auth.authenticateToken, async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "c_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          id: "$id",
          name: "$name",
          description: "$description",
          price: "$price",
          status: "$status",
          categoryId: "$category.c_id",
          categoryName: "$category.name",
        },
      },
    ]);
    // console.log(products);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getCategory/:id", auth.authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;

    const products = await Product.find({
      categoryId: id,
      status: "true",
    }).select("id name");

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getById/:id", auth.authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id).select(
      "id name description price"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res) => {
    try {
      const product = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(product.id, {
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price,
      });

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product id does not exist" });
      }

      return res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

router.delete(
  "/delete/:id",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res) => {
    try {
      const id = req.params.id;

      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product id does not exist" });
      }

      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

router.patch(
  "/updateStatus",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res) => {
    try {
      const { id, status } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(id, { status });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product id does not exist" });
      }

      return res
        .status(200)
        .json({ message: "Product status updated successfully" });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

module.exports = router;
