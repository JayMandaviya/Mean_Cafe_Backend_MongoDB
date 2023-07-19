const express = require("express");
const cors = require("cors");
const db = require("./app/models");
const app = express();
const userRoute = require("./app/controllers/user.controller");
const categoryRoute = require("./app/controllers/category.controller");
const productRoute = require("./app/controllers/product.controller");
const billRoute = require("./app/controllers/bill.controller");
const dashBoardRoute = require("./app/controllers/dashboard.controller");
var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

app.use("/user", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/bill", billRoute);
app.use("/dashboard", dashBoardRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
