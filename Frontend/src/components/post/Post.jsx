// Post.jsx
import "./post.scss";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined"; // Comment icon
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Comments from "../comments/Comments";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns"; // Import date-fns library
import { TextField, Button } from "@mui/material"; // Import Material UI components
import { useSelector, useDispatch } from "react-redux";
import { updatePost } from "../../actions/postsActions";
import { selectPosts } from "../../reducer/postsReducer";
import { selectFollowedUsers } from "../../reducer/followedUsersReducer";
import { selectUser } from "../../reducer/authReducer";
import { API_BASE_URL } from "../../config/config";

const BaseButton = styled.button`
  border: none;
  border-radius: 5px;
  padding: 5px 15px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
`;

const CommentButton = styled(BaseButton)`
  color: white;
  background-color: #938eef;
  margin-right: 5px;

  &:hover {
    background-color: #7a75d6;
  }
`;

const ActionButton = styled(BaseButton)`
  color: white;
  background-color: #938eef;
  margin-right: 5px;

  &:hover {
    background-color: #7a75d6;
  }
`;

const Post = ({ post, fetchCurrentUserPosts }) => {
  const currentUser = useSelector(selectUser);
  const [commentOpen, setCommentOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState(post.text);
  const [timeAgo, setTimeAgo] = useState("");
  const dispatch = useDispatch();
  const followedUsers = useSelector(selectFollowedUsers);
  const posts = useSelector(selectPosts);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  console.log("post", post);

  useEffect(() => {
    const updateTimeInterval = 60000; // 1 minute

    const updateTimer = () => {
      const postDate = new Date(post.date);
      if (!isNaN(postDate)) {
        setTimeAgo(formatDistanceToNow(postDate, { addSuffix: true }));
      } else {
        console.error("Invalid date format in post.date:", post.date);
        setTimeAgo("Unknown time");
      }
    };

    updateTimer(); // Call immediately for the first time
    const interval = setInterval(updateTimer, updateTimeInterval);

    return () => clearInterval(interval);
  }, [post.date]);

  const toggleComments = () => {
    setCommentOpen((prevState) => !prevState);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditedText(post.text); // Reset the edited text to original text if cancelled
  };

  const handleEditSave = async () => {
    try {
      if (post.author === currentUser.username) {
        setIsUploading(true);
        const response = await fetch(
          `${API_BASE_URL}/articles/${post.id}`, // Use 'post.id' instead of 'post.customId'
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: editedText, // Only send 'text' when updating the post's text
            }),
          }
        );
        

        if (!response.ok) {
          throw new Error("Failed to update the post.");
        }

        const updatedPost = await response.json();
        dispatch(updatePost(updatedPost));

        setEditMode(false);
        setError("");

        // Refresh articles
        if (fetchCurrentUserPosts) {
          fetchCurrentUserPosts();
        }
      } else {
        alert("You cannot edit someone else's post.");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  let authorAvatar;

  if (post.author === currentUser.username) {
    // If the post is by the currentUser, use their avatar
    authorAvatar = currentUser.avatar;
  } else {
    // Otherwise, find the author in followedUsers
    const authorData = followedUsers.find(
      (user) => user.username === post.author
    );
    authorAvatar = authorData ? authorData.avatar : post.avatar;
  }

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            {/*different post avatar*/}
            <img src={authorAvatar} alt="" /> {/* Use authorAvatar here */}
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.author}</span>
              </Link>
              <span className="date">{timeAgo}</span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="content">
          {editMode ? (
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
          ) : (
            <p>{post.text}</p>
          )}
          {post.image && <img src={post.image} alt="" />}
        </div>
        <div className="info">
          {editMode ? (
            <>
              <Button onClick={handleEditSave} disabled={isUploading}>
                {isUploading ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleEditCancel} disabled={isUploading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="item" onClick={toggleComments}>
                <TextsmsOutlinedIcon />
                {commentOpen ? "Hide Comments" : "Show Comments"}
              </div>

              <div className="item" onClick={handleEdit}>
                <CreateOutlinedIcon />
                Edit
              </div>
            </>
          )}
        </div>
        {commentOpen && <Comments articleId={post.id} />} {/* Corrected articleId */}
        {error && <div className="error-message">{error}</div>} {/* Display error */}
      </div>
    </div>
  );
};

export default Post;
