const db = require("../models");
const express = require("express");
const router = express.Router();
const Bill = db.bills;
require("dotenv").config();
const auth = require("../services/authentication");

let ejs = require("ejs");
const pdf = require("html-pdf");
let uuid = require("uuid");
let path = require("path");
let fs = require("fs");

router.post("/generateReport", auth.authenticateToken, async (req, res) => {
  try {
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    const productDetailsReport = JSON.parse(orderDetails.productDetails);

    const newBill = new Bill({
      b_id: orderDetails.b_id,
      uuid: generateUuid,
      name: orderDetails.name,
      email: orderDetails.email,
      contactNumber: orderDetails.contactNumber,
      paymentMethod: orderDetails.paymentMethod,
      total: orderDetails.totalAmount,
      productDetails: productDetailsReport,
      createdBy: res.locals.email,
    });
    await newBill.save();

    const reportTemplatePath = path.join(__dirname, "report.ejs");
    const reportHTML = await ejs.renderFile(reportTemplatePath, {
      productDetails: productDetailsReport,
      name: orderDetails.name,
      email: orderDetails.email,
      contactNumber: orderDetails.contactNumber,
      paymentMethod: orderDetails.paymentMethod,
      totalAmount: orderDetails.totalAmount,
    });

    const options = {
      format: "Letter",
    };

    const directory = "./generated_pdf";
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    const filePath = path.join(directory, generateUuid + ".pdf");

    pdf.create(reportHTML, options).toFile(filePath, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        return res.status(200).json({ uuid: generateUuid });
      }
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/getPdf", auth.authenticateToken, async (req, res) => {
  try {
    const orderDetails = req.body;
    const pdfPath = path.join(
      __dirname,
      "../generated_pdf",
      orderDetails.uuid + ".pdf"
    );

    if (fs.existsSync(pdfPath)) {
      res.contentType("application/pdf");
      fs.createReadStream(pdfPath).pipe(res);
    } else {
      const productDetailsReport = JSON.parse(orderDetails.productDetails);
      const reportTemplatePath = path.join(__dirname, "report.ejs");
      const reportHTML = await ejs.renderFile(reportTemplatePath, {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount,
      });

      pdf.create(reportHTML).toFile(pdfPath, async (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          res.contentType("application/pdf");
          fs.createReadStream(pdfPath).pipe(res);
        }
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getBills", auth.authenticateToken, async (req, res) => {
  try {
    const bills = await Bill.find().sort({ id: -1 });
    return res.status(200).json(bills);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete("/delete/:id", auth.authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res.status(404).json({ message: "Bill id not found" });
    }

    return res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
