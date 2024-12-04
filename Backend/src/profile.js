const Profile = require("./model/ProfileSchema");
const User = require("./model/UserSchema");
const { isLoggedIn } = require("./auth");
const bcrypt = require("bcrypt");

const saltRounds = 10;
const stubData = {
  users: {
    user1: {
      email: "user1@example.com",
      zipcode: "12345",
      avatar: "https://example.com/avatar1.png",
      phone: "123-456-7890",
      dob: "1990-01-01",
      password: "hashed_password_stub",
    },
    user2: {
      email: "user2@example.com",
      zipcode: "67890",
      avatar: "https://example.com/avatar2.png",
      phone: "987-654-3210",
      dob: "1995-05-15",
      password: "hashed_password_stub",
    },
  },
};

// Helper function to handle errors
const handleError = (res, error, message = "Internal server error") => {
  console.error(message, error);
  res.status(500).send({ error: message });
};

// Headline functions
async function getHeadline(req, res) {
  const username = req.params.user || req.session.user.username;
  try {
    const user = await Profile.findOne({ username }, "headline").exec();
    if (user) {
      return res.send({ username, headline: user.headline });
    }
    res.status(404).send({ error: "User not found" });
  } catch (error) {
    handleError(res, error);
  }
}

async function updateHeadline(req, res) {
  const { headline } = req.body;
  const user = req.session.user;

  if (!headline) {
    return res.status(400).send({ error: "Headline is required" });
  }

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user._id },
      { $set: { headline } },
      { new: true }
    ).exec();

    if (!updatedProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }

    req.session.user.headline = headline;
    res.status(200).send({ username: user.username, headline });
  } catch (error) {
    handleError(res, error, "Error updating headline");
  }
}

// Email functions
async function getEmail(req, res) {
  const username = req.params.user || "user1";
  const user = stubData.users[username];

  if (user) {
    res.status(200).send({ username, email: user.email });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


async function updateEmail(req, res) {
  const { email } = req.body;
  const username = "user1";

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  if (stubData.users[username]) {
    stubData.users[username].email = email;
    res.status(200).send({ username, email });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


// Zipcode functions
async function getZipcode(req, res) {
  const username = req.params.user || "user1";
  const user = stubData.users[username];

  if (user) {
    res.status(200).send({ username, zipcode: user.zipcode });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


async function updateZipcode(req, res) {
  const { zipcode } = req.body;
  const username = "user1";

  if (!zipcode) {
    return res.status(400).send({ error: "Zipcode is required" });
  }

  if (stubData.users[username]) {
    stubData.users[username].zipcode = zipcode;
    res.status(200).send({ username, zipcode });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


// Avatar functions
async function getAvatar(req, res) {
  const username = req.params.user || "user1";
  const user = stubData.users[username];

  if (user) {
    res.status(200).send({ username, avatar: user.avatar });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


async function updateAvatar(req, res) {
  const { avatar } = req.body;
  const username = "user1";

  if (!avatar) {
    return res.status(400).send({ error: "Avatar URL is required" });
  }

  if (stubData.users[username]) {
    stubData.users[username].avatar = avatar;
    res.status(200).send({ username, avatar });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}

//Phone function
async function getPhone(req, res) {
  const username = req.params.user || "user1";
  const user = stubData.users[username];

  if (user) {
    res.status(200).send({ username, phone: user.phone });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}

async function updatePhone(req, res) {
  const { phone } = req.body;
  const username = "user1";

  if (!phone) {
    return res.status(400).send({ error: "Phone number is required" });
  }

  if (stubData.users[username]) {
    stubData.users[username].phone = phone;
    res.status(200).send({ username, phone });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}

//Dob function
async function getDob(req, res) {
  const username = "user1";
  const user = stubData.users[username];

  if (user) {
    res.status(200).send({ username, dob: user.dob });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


// Password function
async function changePassword(req, res) {
  const { password } = req.body;
  const username = "user1"; 

  if (!password) {
    return res.status(400).send({ error: "New password is required" });
  }

  if (stubData.users[username]) {
    stubData.users[username].password = `hashed_${password}`;
    res.status(200).send({ result: "Password updated successfully (stub)" });
  } else {
    res.status(404).send({ error: "User not found" });
  }
}


// Routes export
module.exports = (app) => {
  app.get("/headline/:user?", isLoggedIn, getHeadline);
  app.put("/headline", isLoggedIn, updateHeadline);

  app.get("/email/:user?", isLoggedIn, getEmail);
  app.put("/email", isLoggedIn, updateEmail);

  app.get("/zipcode/:user?", isLoggedIn, getZipcode);
  app.put("/zipcode", isLoggedIn, updateZipcode);

  app.get("/avatar/:user?", isLoggedIn, getAvatar);
  app.put("/avatar", isLoggedIn, updateAvatar);

  app.get("/phone/:user?", isLoggedIn, getPhone);
  app.put("/phone", isLoggedIn, updatePhone);

  app.get("/dob", isLoggedIn, getDob);

  app.put("/password", isLoggedIn, changePassword);
};
