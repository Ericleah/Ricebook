const User = require("./model/UserSchema");
const Profile = require("./model/ProfileSchema");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");


function generateRandomDOB() {
  // Generate a random date of birth between 1990-01-01 and 2000-12-31
  const year = 1990 + Math.floor(Math.random() * 11);
  const month = Math.floor(Math.random() * 12); // 0-11
  const day = 1 + Math.floor(Math.random() * 28); // days 1-28
  const date = new Date(year, month, day);
  return date.toISOString().split("T")[0];
}

function generateRandomPhone() {
  return String(1000000000 + Math.floor(Math.random() * 9000000000));
}

function generateRandomZipcode() {
  return String(10000 + Math.floor(Math.random() * 90000));
}
const generateValidUsername = (name) => {
  // Remove non-alphanumeric characters and ensure the username starts with a letter
  let baseUsername = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
  if (!/^[a-zA-Z]/.test(baseUsername)) {
    baseUsername = "user" + baseUsername;
  }
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${baseUsername}${randomSuffix}`;
};
const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};


/**
 * Middleware: Check if the user is logged in by verifying session.
 */
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) { // Adjust based on your session management
    req.user = req.session.user;
    next();
  } else {
    res.status(401).send({ error: 'Unauthorized' });
  }
};

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

  // Check if username already exists in the database instead of a local object
  try {
    const user = await User.findOne({ username: username }).exec();

    if (user) {
      return res.status(400).send({ error: "Username already exists" });
    }

    // Generate a salt and hash the password
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).send({ error: "Internal server error" });
      }

      const newUser = new User({
        username,
        password: hash,
        //email,
        //dob,
        //phone,
        //zipcode,
      });

      console.log({ newUser });

      await newUser.save();

      // Now create and save the user profile with the initial information
      const newProfile = new Profile({
        user_id: newUser._id, // This links the Profile to the User document
        username,
        email,
        dob,
        phone,
        zipcode,
        password: hash, //can't store hash, because password can be updated
      });

      console.log({ newProfile });

      await newProfile.save();
      res.send({ username: username, result: "success" });
    });
  } catch (error) {
    return res.status(500).send({ error: "Internal server error" });
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
    const openPaths = ["/", "/login", "/register", "/logout", "/auth/google", "/auth/google/callback",   "/auth/googleRegister"];

    app.use((req, res, next) => {
      if (!openPaths.includes(req.path)) {
        return isLoggedIn(req, res, next);
      }
      next();
    });
    app.post("/auth/googleRegister", async (req, res) => {
      const { displayName, email, photoURL, uid } = req.body;
    
      try {
        let user = await User.findOne({ googleId: uid });
    
        if (!user) {
          // Create random info for new Google user
          const dob = generateRandomDOB();
          const phone = generateRandomPhone();
          const zipcode = generateRandomZipcode();
    
          user = await User.create({
            googleId: uid,
            username: displayName,
          });
    
          await Profile.create({
            user_id: user._id,
            username: displayName,
            email: email || `user${Date.now()}@example.com`,
            avatar: photoURL || "",
            dob,
            phone,
            zipcode,
          });
        }
    
        // Set the session so isLoggedIn middleware works
        req.session.user = user;
    
        // Return user data for frontend
        res.send({
          username: user.username,
          email: email,
          avatar: photoURL,
          uid,
          // add dob, phone, zipcode if you want to return them
          // in that case, fetch them from the Profile model
          // If you want them now:
        });
      } catch (error) {
        console.error("Error in /auth/googleRegister:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });
    // Local Auth Routes
    app.post("/login", login);
    app.post("/register", register);
    app.put("/logout", logout);
  },
  isLoggedIn,
};
