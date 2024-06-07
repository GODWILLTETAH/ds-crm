require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");


const express = require("express");
const mongoose = require("mongoose");


const app = express();
app.use(express.static(path.join(__dirname, "public")));

const router = require("./routes/index");
app.use(cors());
app.use(cookieParser());


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true}));
app.use(express.json({ limit: "50mb" }));
app.use(router);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const DATABASE = process.env.DATABASE;

mongoose
  .connect(DATABASE)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Could not connect to MongoDB...", err));

app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "public", "404_error.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
