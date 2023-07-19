const db = require("../models");
const express = require("express");
const router = express.Router();
const User = db.users;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/createUser", async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const user = await new User({
    u_id: req.body.u_id,
    name: req.body.name,
    contactNumber: req.body.contactNumber,
    email: req.body.email,
    password: req.body.password,
    status: "false",
    role: "user",
  });

  // Save Tutorial in the database
  await user
    .save(user)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
});

router.post("/login", async (req, res) => {
  const user = req.body;

  try {
    const foundUser = await User.findOne({ email: user.email }).select(
      "email password role status"
    );

    if (!foundUser || foundUser.password !== user.password) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    } else if (foundUser.status === "false") {
      return res.status(401).json({ message: "Wait for admin approval" });
    } else if (foundUser.password === user.password) {
      const response = { email: foundUser.email, role: foundUser.role };
      const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
        expiresIn: "8h",
      });
      res.status(200).json({ token: accessToken });
    } else {
      return res
        .status(400)
        .json({ message: "Something went wrong. Please try again" });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).select("email password");
    if (!user) {
      return res.status(200).json({ message: "Password sent to your email" });
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Password by Cafe System",
        html: `<p><b>Your login details for Cafe System</b><br><b>Email:</b>${user.email}<br><b>Password: </b>${user.password}<br><a href="http://localhost:4200/">Click here to login</a></p>`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
    return res.status(200).json({ message: "Password sent to your email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get(
  "/get",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res) => {
    try {
      const query = { role: "user" };
      const users = await User.find(query).select(
        "id name email contactNumber status"
      );
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res) => {
    try {
      const { id, status } = req.body;
      const updatedUser = await User.findByIdAndUpdate(id, { status });

      if (!updatedUser) {
        return res.status(404).json({ message: "User id does not exist" });
      }

      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

router.get("/checktoken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword", auth.authenticateToken, async (req, res) => {
  const user = req.body;
  const email = res.locals.email;

  try {
    const existingUser = await User.findOne({
      email,
      password: user.oldPassword,
    });

    if (!existingUser) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    existingUser.password = user.newPassword;
    await existingUser.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
