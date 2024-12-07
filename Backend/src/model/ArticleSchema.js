// model/ArticleSchema.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  customId: { type: Number, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "profile" }, // Reference to user model
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
  avatar: { type: String }, // Add this field if not already present
});

commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const article = this.parent();
    if (article) {
      let maxId = 0;
      article.comments.forEach((comment) => {
        if (comment.customId > maxId) {
          maxId = comment.customId;
        }
      });
      this.customId = maxId + 1;
    }
  }
  next();
});

const articleSchema = new mongoose.Schema({
  author: String,
  text: { type: String, required: true },
  image: String,
  date: { type: Date, default: Date.now },
  comments: [commentSchema],
  customId: { type: Number, unique: true, index: true },
  created: { type: Date, default: Date.now },
});

// Pre-save hook for articleSchema, handle customId increments if needed

const Article = mongoose.model("Article", articleSchema);
const Comment = mongoose.model("Comment", commentSchema); // If needed

module.exports = {
  Article,
  Comment,
};
