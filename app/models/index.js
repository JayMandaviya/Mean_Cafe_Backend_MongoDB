const dbConfig = require("../../config/db.config");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.users = require("./user.model.js")(mongoose);
db.categorys = require("./category.model")(mongoose);
db.products = require("./product.model")(mongoose);
db.bills = require("./bill.model")(mongoose);

module.exports = db;
