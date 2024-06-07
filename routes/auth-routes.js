const router = require("express").Router();
const { validationRules, validate } = require("../validations/user-validator");
const {
  showSignupForm,
  showSigninForm,
  signin,
  signup,
  verify,
  logout,
} = require("../controllers/auth-controller");
const { ensureAuthenticated } = require("../helpers/auth");

router.get("/signup", async (req, res) => {
  await showSignupForm();
});

router.get("/signin", async (req, res) => {
  await showSigninForm(req, res);
});

router.post("/login", async (req, res) => {
  await signin (req.body, res);
});

router.post("/register", validationRules(), validate, async (req, res) => {
  await signup (req.body, req.body.role, res);
});

router.get("/logout", ensureAuthenticated, logout);

router.post("/verify", async (req, res) => {
  await verify(req.body, res);
});

module.exports = router;
