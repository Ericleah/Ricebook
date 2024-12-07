const express = require("express");
const router = express.Router();
const { Article } = require("./model/ArticleSchema"); // Adjust path as needed
const User = require("./model/UserSchema"); // Import the User model
const { isLoggedIn } = require("./auth"); // Authentication middleware
const Profile = require("./model/ProfileSchema");

async function getCommentAuthor(req, res) {
  const { articleId, commentId } = req.params;

  try {
    const article = await Article.findOne({ customId: parseInt(articleId, 10) }).exec();
    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    const comment = article.comments.find((c) => c.customId === parseInt(commentId, 10));
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }
    
    // Fetch the comment author's details
    const user = await Profile.findById(comment.author).exec();
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.json({ username: user.username });
  } catch (error) {
    console.error("Error fetching comment author:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Define the route
module.exports = (app) => {
  app.get("/getCommentAuthor/:articleId/:commentId", isLoggedIn, getCommentAuthor);
};
