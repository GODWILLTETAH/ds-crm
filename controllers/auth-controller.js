const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const { welcomeSender, forgotPasswordSender } = require("../mailers/senders");

const showSignupForm  = async (req, res) => {
    res.render('signup');
}

const showSigninForm  = async (req, res) => {
    res.render('login');
}

const signup = async (data, role, res) => {
  try {
    const userTaken = await validateEmail(data.email);
    if (userTaken) {
      return res.status(400).json({
        email: "Email is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const nameTaken = await validateName(data.name);
    if (nameTaken) {
      return res.status(400).json({
        name: "Name is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const numberTaken = await validateNumber(data.contact);
    if (numberTaken) {
      return res.status(400).json({
        number: "Number is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const code = crypto.randomInt(100000, 1000000);
    const newUser = new User({
      ...data,
      password: hashedPassword,
      verificationCode: code,
      role,
    });
    await newUser.save();
    welcomeSender(newUser.email, newUser.name, newUser.verificationCode);
    return res.status(201).json({
      message: "Account successfully created",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const signin = async (data, res) => {
  try {
    let { email, password } = data;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Failed login attempt",
        email: "Incorrect email",
        success: false,
      });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = jwt.sign(
        {
          user_id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "3h",
        }
      );
      res.cookie("jwt", token, {
        httpOnly: true,
      });

      let profile = {
        email: user.email,
        role: user.role,
        name: user.name,
        id: user._id,
      };

      let result = {
        user: profile,
        token: token,
        expiresIn: "3h",
      };
      return res.status(200).json({
        ...result,
        message: "Login success",
        success: true,
      });
    } else {
      return res.status(403).json({
        message: "Failed login attempt",
        email: "Incorrect password",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/signin");
};

const verify = async (data, res) => {
  try {
    let { code } = data;
    const user = await User.findOne({ verificationCode: code });
    if (!user) {
      return res.status(404).json({
        message: "Invalid code",
        success: false,
      });
    } else if (user.isEmailVerified) {
      return res.status(404).json({
        message: "Email already verified",
        success: false,
      });
    }

    user.isEmailVerified = true;
    await user.save();
    return res.status(201).json({
      message: "Email verification success",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  if (user) {
    return true;
  } else {
    return false;
  }
};
const validateName = async (name) => {
  let user = await User.findOne({ name });
  return user !== null;
};

const validateNumber = async (contact) => {
  let user = await User.findOne({ contact });
  return user !== null;
};

module.exports = {
  showSigninForm,
  showSignupForm,
  signin,
  signup,
  verify,
  logout,
};
