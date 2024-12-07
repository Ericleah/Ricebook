const { isLoggedIn } = require("./auth");
const mongoose = require("mongoose");
const { Article, Comment } = require("./model/ArticleSchema");
const User = require("./model/UserSchema");
const { uploadImage } = require('./uploadCloudinary');
const Profile = require("./model/ProfileSchema");



async function createArticle(req, res) {
  const {text} = req.body;
  const loggedInUser = req.session.user.username;
  const image = req.file ? req.file.path : null;
  const customId = Math.floor(Math.random() * 1000000);

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
      customId: customId,
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
  const loggedInUser = req.session.user.username; // The user making the request
  const usernameQuery = req.query.username || loggedInUser; // If no username provided, use the logged-in user
  const page = parseInt(req.query.page) || 1;
  const limit = 4; // Adjust as needed
  const skip = (page - 1) * limit;

  try {
    // Find the user for the given usernameQuery
    const user = await User.findOne({ username: usernameQuery }).exec();
    if (!user) {
      // If no user found with usernameQuery, return empty
      return res.json({ articles: [], totalPages: 1 });
    }

    // Find followed users of `user`
    const followedUserIds = user.following || [];
    const followedUsersDocs = await User.find({ _id: { $in: followedUserIds } }).exec();
    const followedUsernames = followedUsersDocs.map((u) => u.username);

    // Authors should include the requested user and their followed users
    const authors = [usernameQuery, ...followedUsernames];

    // Fetch articles from these authors, sorted by date desc, with pagination
    const [articles, count] = await Promise.all([
      Article.find({ author: { $in: authors } })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Article.countDocuments({ author: { $in: authors } }),
    ]);

    const totalPages = Math.ceil(count / limit);

    const response = articles.map((article) => ({
      id: article.customId,
      author: article.author,
      text: article.text,
      comments: article.comments,
      date: article.date,
      image: article.image,
    }));

    res.json({ articles: response, totalPages });
  } catch (error) {
    console.error("Error fetching articles:", error);
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
  const { text, commentId, avatar } = req.body;
  const articleId = parseInt(req.params.id, 10);
  const loggedInUsername = req.session.user.username; // Use username instead of _id
  const userAvatar = avatar;

  if (isNaN(articleId)) {
    return res.status(400).send({ error: "Invalid article ID" });
  }

  if (!text) {
    return res.status(400).send({ error: "Text content is required" });
  }

  try {
    const article = await Article.findOne({ customId: articleId }).exec();

    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }
    // Resolve username to ObjectId
    const loggedInUserProfile = await Profile.findOne({ username: loggedInUsername });
    if (!loggedInUserProfile) {
      return res.status(404).send({ error: "User profile not found" });
    }
    const loggedInUserId = loggedInUserProfile._id; // Convert username to ObjectId

    // Check authorship only if editing article text
    if (commentId === undefined) {
      // Editing the article text => must be article author
      console.log("Editing article text");
      if (article.author !== loggedInUsername) {
        return res.status(403).send({ error: "Forbidden" });
      }
      article.text = text;
    } else if (commentId === -1) {
      // Add a new comment => any logged-in user can comment
      article.comments.push({
        body: text,
        author: loggedInUserId, // Use ObjectId here
        avatar: userAvatar, // Include avatar if available
        date: new Date(),
      });
    } else {
      // Editing a comment => must be that comment's author
      const parsedCommentId = parseInt(commentId, 10);
      if (isNaN(parsedCommentId)) {
        return res.status(400).send({ error: "Invalid comment ID" });
      }

      const comment = article.comments.find((c) => c.customId === parsedCommentId);
      if (!comment) {
        return res.status(404).send({ error: "Comment not found" });
      }
      
      console.log("loggedInUsername:", loggedInUsername); 
      console.log("comment.author:", comment.author);
      const commentAuthorProfile = await Profile.findById(comment.author);
      const commentAuthorUsername = commentAuthorProfile.username;
      if (commentAuthorUsername !== loggedInUsername) {
        return res.status(403).send({ error: "Forbidden" });
      }
      comment.body = text;
    }

    await article.save();

    await article.populate([
      { path: "author", select: "username avatar" },
      { path: "comments.author", select: "username avatar" },
    ]);

    const mappedArticle = {
      id: article.customId,
      author: article.author.username,
      avatar: article.author.avatar,
      text: article.text,
      date: article.date,
      image: article.image,
      comments: article.comments.map((c) => ({
        customId: c.customId,
        author: c.author.username,
        avatar: c.author.avatar,
        body: c.body,
        date: c.date,
      })),
    };

    res.status(200).json(mappedArticle);
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