const User = require("./model/UserSchema");
const Profile = require("./model/ProfileSchema");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/**
 * Middleware: Check if the user is logged in by verifying session.
 */
function isLoggedIn(req, res, next) {
  const user = req.session.user;
  if (!user) {
    return res.sendStatus(401); // Unauthorized
  }
  next();
}

/**
 * POST /login: Authenticate user and set session.
 */
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = user;

      // // Set httpOnly cookie for the session ID
      // res.cookie("connect.sid", req.session.id, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      // });

      postLoginMiddleware(req, res, () => {
        // After the postLoginMiddleware has been applied,
        // you can then send back the response to the client.
        res.send({ username: username, result: "success" });
      });
    }
      else {
      res.status(401).send({ error: "Invalid password" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function postLoginMiddleware(req, res, next) {

  next();
}

/**
 * POST /register: Create a new user and profile with hashed password.
 */
async function register(req, res) {
  const { username, password, email, dob, phone, zipcode } = req.body;

  if (!username || !password || !email || !dob || !phone || !zipcode) {
    return res.status(400).send({ error: "Fill out all required information" });
  }

  try {
    const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      return res.status(400).send({ error: "Username already exists" });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      password: hash,
    });

    await newUser.save();

    const newProfile = new Profile({
      user_id: newUser._id,
      username,
      email,
      dob,
      phone,
      zipcode,
      password: hash,
    });
    
    console.log({ newProfile });

    await newProfile.save();

    res.send({ username, result: "success" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

/**
 * PUT /logout: Log out the user by clearing the session.
 */
function logout(req, res) {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send({ error: "Internal server error" });
      }
      res.clearCookie("connect.sid", { httpOnly: true });
      res.send({ result: "success" });
    });
  } else {
    res.status(401).send({ error: "You are not logged in" });
  }
}

/**
 * Define authentication routes and apply middleware.
 */
module.exports = {
  AuthRoutes: (app) => {
    const openPaths = ["/", "/login", "/register", "/logout"];

    app.use((req, res, next) => {
      if (!openPaths.includes(req.path)) {
        return isLoggedIn(req, res, next);
      }
      next();
    });

    app.post("/login", login);
    app.post("/register", register);
    app.put("/logout", logout);
  },
  isLoggedIn,
};
