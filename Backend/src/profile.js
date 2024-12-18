const Profile = require("./model/ProfileSchema");
const User = require("./model/UserSchema");
const { isLoggedIn } = require("./auth");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { uploadImage, uploadAvatar } = require('./uploadCloudinary');
const { Article } = require("./model/ArticleSchema"); // Adjust the path as needed
//const Article = require("./model/Article");
//const Comment = require("./model/Comment");

/**
 * Update all comments authored by the user with the new avatar.
 * @param {ObjectId} userId - The user's ObjectId from the Profile collection.
 * @param {string} newAvatarUrl - The new avatar URL to update in comments.
 */

const updateUserCommentsAvatar = async (userId, newAvatarUrl) => {
  try {
    const result = await Article.updateMany(
      { "comments.author": userId },  // Match articles where at least one comment has the given userId as author
      { $set: { "comments.$[elem].avatar": newAvatarUrl } }, // Set the avatar field
      {
        arrayFilters: [{ "elem.author": userId }], // Only update comments where author matches userId
      }
    );

    console.log(
      `Updated avatar in ${result.modifiedCount} articles for user ID ${userId}`
    );
  } catch (error) {
    console.error("Error updating avatars in user comments:", error);
    throw new Error("Failed to update user comments' avatars");
  }
};


// Function to get a user's headline
async function getHeadline(req, res) {
  const username = req.params.user || req.session.user.username;

  try {
    const user = await Profile.findOne({ username }, "headline").exec(); // Select only the headline field
    if (user) {
      // Send the headline or the default headline if it doesn't exist
      res.send({ username: username, headline: user.headline });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateHeadline(req, res) {
  const user = req.session.user;
  const { headline } = req.body;

  // Check if headline is provided
  if (!headline) {
    return res.status(400).send({ error: "Headline is required" });
  }

  try {
    // Update the user's headline in the database
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user._id }, // Use the username to identify the profile to update
      { $set: { headline: headline } },
      { new: true }
    ).exec();

    // If the profile was not found, send a 404 response
    if (!updatedProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }

    // Update the session with the new headline
    req.session.user.headline = headline;

    // Send back the updated headline
    res.status(200).send({ username: user.username, headline: headline });
  } catch (error) {
    console.error("Error updating headline:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function getEmail(req, res) {
  const username = req.params.user || req.session.user.username;

  try {
    const profile = await Profile.findOne({ username }, "email").exec();

    if (profile && profile.email) {
      res.send({ username: username, email: profile.email });
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
}

async function updateEmail(req, res) {
  const user = req.session.user;
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  try {
    // Update the user's email in the database
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user._id },
      { $set: { email: email } },
      { new: true }
    ).exec();

    // If the profile was not found, send a 404 response
    if (!updatedProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }

    // Update the session with the new email
    //req.session.user.email = email;

    // Send back the updated email
    console.log({ username: user.username, email: email });
    res.status(200).send({ username: user.username, email: email });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function getZipcode(req, res) {
  const username = req.params.user || req.session.user.username;

  try {
    const profile = await Profile.findOne({ username }, "zipcode").exec();
    if (profile && profile.zipcode) {
      res.send({ username: username, zipcode: profile.zipcode });
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching zipcode:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function updateZipcode(req, res) {
  const user = req.session.user;
  const { zipcode } = req.body;

  // Check if zipcode is provided
  if (!zipcode) {
    return res.status(400).send({ error: "Zipcode is required" });
  }

  try {
    // Update the user's zipcode in the database using user._id
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user._id }, // Use user._id to identify the profile to update
      { $set: { zipcode: zipcode } },
      { new: true }
    ).exec();

    if (!updatedProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }

    // Update the session with the new zipcode
    //req.session.user.zipcode = zipcode;

    res.status(200).send({ username: user.username, zipcode: zipcode });
  } catch (error) {
    console.error("Error updating zipcode:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function getDob(req, res) {
  const username = req.params.user || req.session.user.username;

  try {
    const profile = await Profile.findOne({ username }, "dob").exec();
    if (profile && profile.dob) {
      // Format the date as a string (e.g., in ISO format)
      //const dobAsString = user.dob.toISOString();
      res.status(200).json({
        username: username,
        dob: profile.dob,
      });
    } else {
      // If the user or user.dob doesn't exist, send an appropriate response
      res.status(404).json({ error: "User or date of birth not found" });
    }
  } catch (error) {
    console.error("Error fetching date of birth:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAvatar(req, res) {
  // Get the username from the request parameters or from the logged-in user session
  const username = req.params.user || req.session.user.username;

  try {
    // Find the user by username and select only the avatar field
    const profile = await Profile.findOne(
      { username: username },
      "avatar"
    ).exec();

    if (profile && profile.avatar) {
      // Send the avatar URL if the user exists and has an avatar set
      res.status(200).json({ username: username, avatar: profile.avatar });
    } else {
      // If no user is found, send an appropriate error message
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    // If there is a server error, log it and send a 500 error
    console.error("Error fetching avatar:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

const putAvatar = async (req, res) => {
  console.log("Received PUT /avatar request");
  try {
    const userId = req.user._id;
    console.log("Authenticated User ID:", userId);

    if (!req.file) {
      console.error("No file received");
      return res.status(400).send({ error: "Avatar file is required" });
    }

    const avatarUrl = req.file.path;
    console.log("Uploaded Avatar URL:", avatarUrl);

    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: userId },
      { avatar: avatarUrl },
      { new: true }
    );

    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      { avatar: avatarUrl },
      { new: true }
    );

    if (!updatedProfile) {
      console.error("Profile not found for user:", userId);
      return res.status(404).send({ error: "Profile not found" });
    }
    await updateUserCommentsAvatar(updatedProfile._id, avatarUrl);

    console.log("Avatar updated in Profile and propagated to comments");
    console.log("User avatar updated successfully:", updatedProfile.avatar);

    res.status(200).send({ avatar: updatedProfile.avatar,});
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).send({ error: "Failed to update avatar." });
  }
};


const mongoose = require("mongoose");

async function changePassword(req, res) {
  const user = req.session.user;
  const { password } = req.body;

  // Validate the new password; this can be more complex depending on your password policies
  if (!password) {
    return res.status(400).send({ error: "New password is required" });
  }

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    // Update the user's password in the database
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user._id },
      { $set: { password: hash } },
      { new: true }
    ).exec();

    // Update the user's password in the Users collection (if you have a separate Users model)
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { password: hash } },
      { new: true }
    ).exec();

    // If the user was not found or not updated, send a 404 response
    if (!updatedProfile || !updatedUser) {
      return res.status(404).send({ error: "User not found" });
    }

    req.session.user.password = hash;

    res.status(200).send({ result: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function getPhone(req, res) {
  const username = req.params.user || req.session.user.username;

  try {
    const profile = await Profile.findOne({ username }, "phone").exec();
    if (profile && profile.phone) {
      res.send({ username: username, phone: profile.phone });
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching zipcode:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function updatePhone(req, res) {
  const user = req.session.user;
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).send({ error: "New phone number is required" });
  }

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user._id }, // Use the correct filter
      { $set: { phone: phone } },
      { new: true }
    ).exec();

    if (!updatedProfile) {
      return res.status(404).send({ error: "Profile not found" });
    }

    // Update the session with the new phone number
    //req.session.user.phone = phone;

    res.status(200).send({ username: user.username, phone: phone });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function linkThirdPartyUser(req, res){
  const { displayName, email, photoURL, uid } = req.body;

  if (!displayName || !uid) {
    return res.status(400).send({ error: "Missing required fields: displayName, uid" });
  }

  try {
    // Check if user is logged in normally
    let sessionUser = req.session.user;

    if (sessionUser) {
      // User is logged in with normal credentials
      // Just update their account with googleId
      let user = await User.findById(sessionUser._id).exec();
      if (!user) {
        // If no user found by sessionUser._id, fallback to registration logic
        user = await createNewGoogleUser(uid, displayName, email, photoURL);
        req.session.user = user;
        const profile = await Profile.findOne({ user_id: user._id }).exec();
        return res.send({
          username: user.username,
          email: profile?.email || email || `user${Date.now()}@example.com`,
          avatar: profile?.avatar || photoURL || "",
          dob: profile?.dob || "",
          phone: profile?.phone || "",
          zipcode: profile?.zipcode || "",
          uid,
          googleId: user.googleId
        });
      }

      // If user found, set googleId
      if (!user.googleId) {
        user.googleId = uid;
        await user.save();
      }

      // user already had a profile from normal register
      const profile = await Profile.findOne({ user_id: user._id }).exec();
      // Update session
      req.session.user = user;
      return res.send({
        username: user.username,
        email: profile?.email || email || `user${Date.now()}@example.com`,
        avatar: profile?.avatar || photoURL || "",
        dob: profile?.dob || "",
        phone: profile?.phone || "",
        zipcode: profile?.zipcode || "",
        uid,
        googleId: user.googleId
      });

    } else {
      // If user isn't logged in normally, fallback to googleRegister logic
      // Check by googleId or username
      let user = await User.findOne({ username: displayName }).exec();
      if (user) {
        // username exists, link googleId if not present
        if (!user.googleId) {
          user.googleId = uid;
          await user.save();
        }
        req.session.user = user;
        const profile = await Profile.findOne({ user_id: user._id }).exec();
        return res.send({
          username: user.username,
          email: profile?.email || email || `${Date.now()}@example.com`,
          avatar: profile?.avatar || photoURL || "",
          dob: profile?.dob || "",
          phone: profile?.phone || "",
          zipcode: profile?.zipcode || "",
          uid,
          googleId: user.googleId
        });
      }

      // If no user by username, check googleId
      user = await User.findOne({ googleId: uid }).exec();
      if (user) {
        // If found by googleId, just log in
        req.session.user = user;
        const profile = await Profile.findOne({ user_id: user._id }).exec();
        return res.send({
          username: user.username,
          email: profile?.email || email || `${Date.now()}@example.com`,
          avatar: profile?.avatar || photoURL || "",
          dob: profile?.dob || "",
          phone: profile?.phone || "",
          zipcode: profile?.zipcode || "",
          uid,
          googleId: user.googleId
        });
      }

      // If neither found, create new user and profile
      user = await createNewGoogleUser(uid, displayName, email, photoURL);
      req.session.user = user;
      const profile = await Profile.findOne({ user_id: user._id }).exec();
      return res.send({
        username: user.username,
        email: profile?.email,
        avatar: profile?.avatar,
        dob: profile?.dob,
        phone: profile?.phone,
        zipcode: profile?.zipcode,
        uid,
        googleId: user.googleId,
      });
    }
  } catch (error) {
    console.error("Error in /linkThirdPartyUser:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

async function unlinkThirdPartyUser(req, res){
  const { username } = req.body;

  if (!username) {
    return res.status(400).send({ error: "Username is required" });
  }

  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const profile = await Profile.findOne({ user_id: user._id }).exec();

    if (!profile) {
      return res.status(404).send({ error: "Profile not found" });
    }

    // Check if the user is google-only (no normal password)
    const googleOnly = !user.password || user.password === "";

    if (googleOnly) {
      // If user was created solely via Google (no password), removing google means no login method left.
      // Decide to delete user and profile entirely
      await Profile.deleteOne({ user_id: user._id });
      await User.deleteOne({ _id: user._id });

      // Also clear session if this operation is done while logged in
      if (req.session.user && req.session.user._id.toString() === user._id.toString()) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            // It's not critical if session can't be destroyed. Still return success.
          }
        });
      }

      return res.send({ result: "User and profile deleted because user was Google-only" });
    } else {
      // If user has normal credentials, just unlink the google account
      user.googleId = undefined; // remove googleId
      await user.save();

      profile.isThirdPartyUser = false; 
      await profile.save();

      res.send({ result: "success" });
    }
  } catch (error) {
    console.error("Error unlinking third party account:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};



module.exports = (app) => {
  app.get("/headline/:user?", isLoggedIn, getHeadline);
  app.put("/headline", isLoggedIn, updateHeadline);

  app.get("/email/:user?", isLoggedIn, getEmail);
  app.put("/email", isLoggedIn, updateEmail);

  app.get("/zipcode/:user?", isLoggedIn, getZipcode);
  app.put("/zipcode", isLoggedIn, updateZipcode);

  app.get("/dob/:user?", isLoggedIn, getDob);

  app.get("/avatar/:user?", isLoggedIn, getAvatar);
  app.put("/avatar", isLoggedIn, uploadAvatar, putAvatar);

  app.put("/password", isLoggedIn, changePassword);

  app.get("/phone/:user?", isLoggedIn, getPhone);
  app.put("/phone", isLoggedIn, updatePhone);

  app.post("/linkThirdPartyUser", isLoggedIn, linkThirdPartyUser);
  app.delete("/unlinkThirdPartyUser", isLoggedIn, unlinkThirdPartyUser);

};