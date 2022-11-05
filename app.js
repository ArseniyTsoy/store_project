import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import http from "http";
import express from "express";
import multer from "multer";
import csrf from "csurf";
import session from "express-session";
import expressSession from "express-mysql-session";
import { poolConnect } from "./util/db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import storeRoutes from "./routes/store.js";
import userRoutes from "./routes/user.js";
import errorController from "./middleware/errors.js";

const MySQLStore = expressSession(session);

// Constructing __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csrfProtection = csrf();

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

// Request body parser
app.use(express.urlencoded({ extended: false }));

// CSRF tokens
app.use(csrfProtection);

// res.locals
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
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

// Error handling
app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  return res.redirect("/500");
});

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