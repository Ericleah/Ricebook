require("dotenv").config();
require("./db");
const {AuthRoutes} = require("./src/auth");
const ArticlesRoutes = require("./src/articles");
const ProfileRoutes = require("./src/profile");
const FollowingRoutes = require("./src/following");
const CommentRoutes = require("./src/comment");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const morgan = require("morgan"); // HTTP request logger

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev")); // Log all incoming requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Configure session middleware
app.set('trust proxy', 1);

app.use(
  session({
    secret: "rice university",
    resave: true,
    saveUninitialized: false,
    cookie: { httpOnly: true, 
      secure: true,
    }, 
  })
);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.get("/", (req, res) => res.send({ hello: "world" }));
AuthRoutes(app);
ArticlesRoutes(app);
ProfileRoutes(app);
FollowingRoutes(app);
CommentRoutes(app);

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}
// At the end of index.js
module.exports = app;