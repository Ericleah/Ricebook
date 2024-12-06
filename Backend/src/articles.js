const { isLoggedIn } = require("./auth");
const mongoose = require("mongoose");
const { Article, Comment } = require("./model/ArticleSchema");
const User = require("./model/UserSchema");
const { uploadImage } = require('./uploadCloudinary');


//const Article = require("./model/Article");
//const Comment = require("./model/Comment");

async function createArticle(req, res) {
  const {text} = req.body;
  const loggedInUser = req.session.user.username;
  const image = req.file ? req.file.path : null;

  // Validate the input
  if (!text) {
    return res.status(400).send({ error: "Text content is required for the article" });
  }

  try {
    const newArticle = new Article({
      author: loggedInUser,
      text: text,
      image: image,
      date: new Date(),
      comments: [],
    });

    const savedArticle = await newArticle.save();

    res.status(201).json({
      articles: [
        {
          id: savedArticle.customId,
          author: savedArticle.author,
          text: savedArticle.text,
          image: savedArticle.image,
          date: savedArticle.date,
          comments: savedArticle.comments,
        },
      ],
    });
  } catch (error) {
    console.error("Error creating new article:", error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).send({ error: error.message });
    }

    res.status(500).send({ error: "Internal server error" });
  }
}


async function getArticles(req, res) {
  const identifier = req.params.id; // Can be a post id or username
  const loggedInUser = req.session.user.username;

  try {
    let articles;
    if (identifier) {
      if (!isNaN(identifier)) {
        articles = await Article.find({ customId: identifier }).exec();
      } else {
        articles = await Article.find({ author: identifier }).exec();
      }
    } else {
      articles = await Article.find({
        /*  feed logic here */
      }).exec();
    }

    const response = articles.map((article) => ({
      id: article.customId,
      author: article.author,
      text: article.text,
      comments: article.comments,
      date: article.date,
    }));

    res.json({ articles: response });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
}

async function findAuthorIdByUsername(authorUsername) {
  try {
    const author = await User.findOne({ username: authorUsername }).exec();
    if (author) {
      return author._id; // This is the ObjectId of the author
    } else {
      return null; // No author found with the given username
    }
  } catch (error) {
    console.error("Error finding author by username:", error);
    return null;
  }
}

async function updateArticle(req, res) {
  const commentId = req.body.commentId !== undefined ? parseInt(req.body.commentId) : undefined;
  const { text } = req.body;
  const articleId = req.params.id;
  const loggedInUserId = req.session.user._id; // Ensure this is a MongoDB ObjectId

  if (!text) {
    return res.status(400).send({ error: "Text content is required" });
  }

  try {
    const article = await Article.findOne({ customId: articleId }).exec();

    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    // Find the author's ObjectId based on username
    const authorObjectId = await findAuthorIdByUsername(article.author);
    if (!authorObjectId) {
      return res.status(400).send({ error: "Author not found" });
    }

    if (!authorObjectId.equals(loggedInUserId)) {
      return res.status(403).send({ error: "Forbidden" });
    }

    if (commentId === undefined) {
      // Update article text
      article.text = text;
    } else if (commentId === -1) {
      // Add a new comment
      const newComment = new Comment({
        body: text,
        author: loggedInUserId,
      });
      article.comments.push(newComment);
    } else {
      // Edit an existing comment
      const comment = article.comments.find((c) => c.customId === commentId);
      if (!comment) {
        return res.status(404).send({ error: "Comment not found" });
      }

      // Check if the current user is the author of the comment
      if (!comment.author.equals(loggedInUserId)) {
        return res.status(403).send({ error: "Forbidden" });
      }
      comment.body = text;
    }

    await article.save();
    res.status(200).json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}


module.exports = (app) => {
  app.post("/article", isLoggedIn, uploadImage('image'), createArticle);
  app.get("/articles/:id?", isLoggedIn, getArticles);
  app.put("/articles/:id", isLoggedIn, updateArticle);
};