const User = require("./model/UserSchema");
const { isLoggedIn } = require("./auth");

async function getFollowing(req, res) {
  const username = req.params.user || req.session.user.username;

  try {
    const user = await User.findOne({ username: username })
      .populate("following", "username")
      .exec();

    if (user) {
      const followingUsernames = user.following.map((user) => user.username);
      res
        .status(200)
        .json({ username: username, following: followingUsernames });
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function addToFollowing(req, res) {
  const usernameToFollow = req.params.user;
  const loggedInUser = req.session.user;

  if (!usernameToFollow) {
    return res.status(400).send({ error: "Username to follow is required" });
  }

  try {
    const userToFollow = await User.findOne({
      username: usernameToFollow,
    }).exec();
    if (!userToFollow) {
      return res.status(404).send({ error: "User to follow not found" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: loggedInUser._id, following: { $ne: userToFollow._id } }, 
      { $addToSet: { following: userToFollow._id } }, 
      { new: true } 
    ).populate("following", "username"); 

    if (updatedUser) {
      const updatedFollowingUsernames = updatedUser.following.map(
        (user) => user.username
      );
      console.log(updatedFollowingUsernames);
      res.status(200).json({
        username: loggedInUser.username,
        following: updatedFollowingUsernames,
      });
    } else {
      res.status(404).send({ error: "Logged in user not found" });
    }
  } catch (error) {
    console.error("Error adding to following list:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function removeFromFollowing(req, res) {
  const loggedInUserId = req.session.user._id;
  const usernameToUnfollow = req.params.user; 

  try {
    const loggedInUser = await User.findById(loggedInUserId);

    const userToUnfollow = await User.findOne(
      { username: usernameToUnfollow },
      "_id"
    );
    if (!userToUnfollow) {
      return res.status(404).send({ error: "User to unfollow not found" });
    }

    if (!loggedInUser.following.includes(userToUnfollow._id)) {
      return res.status(400).send({ error: "You are not following this user" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      loggedInUserId,
      { $pull: { following: userToUnfollow._id } }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ error: "Logged in user not found" });
    }

    // Update the session information if necessary
    // ...

    // Return the updated list of following to the client
    res.status(200).send({
      username: req.session.user.username,
      following: updatedUser.following.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("Error removing from following:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}


// Route definitions
module.exports = (app) => {
  app.get("/following/:user?", isLoggedIn, getFollowing);
  app.put("/following/:user", isLoggedIn, addToFollowing);
  app.delete("/following/:user", isLoggedIn, removeFromFollowing);
};
