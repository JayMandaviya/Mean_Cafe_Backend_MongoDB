const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();

// async function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
//     const user = await User.findOne({ email: decoded.email }).select(
//       "email role"
//     );

//     if (!user) {
//       return res.sendStatus(403);
//     }

//     res.locals = { email: user.email, role: user.role };
//     next();
//   } catch (err) {
//     return res.sendStatus(403);
//   }
// }

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, response) => {
    if (err) return res.sendStatus(403);
    res.locals = response;
    next();
  });
}

module.exports = { authenticateToken: authenticateToken };
