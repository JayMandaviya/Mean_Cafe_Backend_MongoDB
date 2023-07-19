const db = require("../models");
const express = require("express");
const router = express.Router();
const Category = db.categorys;
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
    const newCategory = await new Category({
      name: req.body.name,
      c_id: req.body.c_id
    });

    await newCategory
      .save(newCategory)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Category.",
        });
      });
  }
);

router.get("/get", auth.authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    return res.status(200).json(categories);
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
      const { id, name } = req.body;

      const updatedCategory = await Category.findByIdAndUpdate(id, { name });

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category id does not exist" });
      }

      return res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

module.exports = router;
