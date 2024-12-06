// routes/comments.js
const express = require("express");
const router = express.Router();
const { Article } = require("./model/ArticleSchema"); // Adjust path as needed
const { isLoggedIn } = require("./auth"); // Authentication middleware

async function getCommentAuthor(req, res) {
  const { articleId, commentId } = req.params;

  try {
    const article = await Article.findOne({ customId: articleId }).exec();
    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    const comment = article.comments.find((c) => c.customId === parseInt(commentId));
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    // Assuming you have a User model to fetch username by ObjectId
    const user = await User.findById(comment.author).exec();
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
}