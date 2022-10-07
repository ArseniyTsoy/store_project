const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const express = require("express");
const { poolConnect } = require("./util/db");
const multer = require("multer");
const storeRoutes = require("./routes/store");

dotenv.config({
  path: path.join(__dirname, "config", "config.env")
});

const app = express();

const fileStorage = multer.diskStorage({
  destination(_, _2, cb) {
    cb(null, "images");
  },
  filename(_, file, cb) {
    cb(null, new Date().toISOString() + "_" + file.originalname);
  }
});

const fileFilter = function(req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single("image"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

app.use(storeRoutes);

const MODE = process.env.NODE_ENV;
const PORT = (MODE === "production") ? process.env.PORT : 8080;

const server = http.createServer(app);

poolConnect(function() {
  server.listen(
    PORT, 
    console.log(`The app is running in the ${MODE} mode on port ${PORT}`)
  );
});