const User = require("./model/UserSchema");
const { isLoggedIn } = require("./auth");

const stubData = {
  users: {
    user1: {
      username: "user1",
      following: ["user2", "user3"],
    },
    user2: {
      username: "user2",
      following: ["user3"],
    },
    user3: {
      username: "user3",
      following: [],
    },
  },
};

// Fetch the list of users a user is following
async function getFollowing(req, res){
  const username = req.params.user || "user1";
  const user = stubData.users[username];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ username: user.username, following: user.following });
};


// Add a user to the following list
async function addToFollowing(req, res){
  const usernameToFollow = req.params.user;
  const loggedInUsername = "user1";
  const loggedInUser = stubData.users[loggedInUsername];

  if (!usernameToFollow) {
    return res.status(400).json({ error: "Username to follow is required" });
  }

  const userToFollow = stubData.users[usernameToFollow];
  if (!userToFollow) {
    return res.status(404).json({ error: "User to follow not found" });
  }

  if (!loggedInUser.following.includes(usernameToFollow)) {
    loggedInUser.following.push(usernameToFollow);
  }

  res.status(200).json({ username: loggedInUsername, following: loggedInUser.following });
};


// Remove a user from the following list
async function removeFromFollowing(req, res){
  const usernameToUnfollow = req.params.user;
  const loggedInUsername = "user1";
  const loggedInUser = stubData.users[loggedInUsername];

  if (!usernameToUnfollow) {
    return res.status(400).json({ error: "Username to unfollow is required" });
  }

  if (!loggedInUser.following.includes(usernameToUnfollow)) {
    return res.status(400).json({ error: "You are not following this user" });
  }

  loggedInUser.following = loggedInUser.following.filter(
    (username) => username !== usernameToUnfollow
  );

  res.status(200).json({ username: loggedInUsername, following: loggedInUser.following });
};


// Route definitions
module.exports = (app) => {
  app.get("/following/:user?", isLoggedIn, getFollowing);
  app.put("/following/:user", isLoggedIn, addToFollowing);
  app.delete("/following/:user", isLoggedIn, removeFromFollowing);
};
