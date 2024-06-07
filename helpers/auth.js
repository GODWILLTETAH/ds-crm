const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const ensureAuthenticated = (req, res, next) => {
  const token =
    req.cookies.jwt ||
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        //res.redirect("/signin");
        const redirectUrl = encodeURIComponent(req.originalUrl);
        res.redirect(`/signin?redirect=${redirectUrl}`);
      } else {
        req.user = decodedToken;
        next();
      }
    });
  } else {
    //res.redirect("/signin");
    const redirectUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`/signin?redirect=${redirectUrl}`);
  }
};

const checkUser = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.profile = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

const ensureAuthorized = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  // return res.status(401).json({
  //   message: "Unauthorized",
  //   success: false,
  // });
  res.render("unauthorized");
};

module.exports = {
  ensureAuthenticated,
  checkUser,
  ensureAuthorized,
};
