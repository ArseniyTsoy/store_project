const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const express = require("express");
const { poolConnect } = require("./util/db");
const multer = require("multer");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const storeRoutes = require("./routes/store");
const userRoutes = require("./routes/user");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

// EV-s
dotenv.config({
  path: path.join(__dirname, "config", "config.env")
});

// Creating a new app instance
const app = express();

// Uploading image files
const fileStorage = multer.diskStorage({
  destination(_, _2, cb) {
    cb(null, "images/uploaded");
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

// Sessions + session store
const options = {
  host: process.env.HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
};
const sessionStore = new MySQLStore(options);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

// Static folders
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Template engine
app.set("view engine", "pug");
app.set("views", "views");

// Parser
app.use(express.urlencoded({ extended: false }));

// res.locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.user = req.session.user;
  res.locals.cartItems = req.session.cartItems;
  res.locals.wishlistItems = req.session.wishlistItems;
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use(storeRoutes);

// Launching the server
const MODE = process.env.NODE_ENV;
const PORT = (MODE === "production") ? process.env.PORT : 8080;

const server = http.createServer(app);

poolConnect(function() {
  server.listen(
    PORT, 
    console.log(`The app is running in the ${MODE} mode on port ${PORT}`)
  );
});