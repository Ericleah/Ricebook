// Comments.jsx
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import "./comments.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import {
  addComment,
  setComments,
  updateComment,
} from "../../actions/postsActions";
import { selectComments } from "../../reducer/postsReducer";
import { selectFollowedUsers } from "../../reducer/followedUsersReducer";
import styled from "styled-components";
import EditIcon from "@mui/icons-material/Edit";
import { selectPosts } from "../../reducer/postsReducer";
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

const Comments = ({ articleId }) => {
  const dispatch = useDispatch();
  const comments = useSelector((state) => selectComments(state, articleId));
  const currentUser = useSelector(selectUser);
  const [inputValue, setInputValue] = useState("");
  const followedUsers = useSelector(selectFollowedUsers);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentBody, setEditedCommentBody] = useState("");
  const posts = useSelector(selectPosts);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Initialize toast notifications (if using react-toastify)
  useEffect(() => {
    // Initialize if necessary
  }, []);

  // Log the received articleId
  useEffect(() => {
    console.log("Received articleId:", articleId);
    if (articleId === undefined) {
      setError("Invalid article ID. Unable to load comments.");
    }
  }, [articleId]);

  // Fetch comments when the component mounts
  useEffect(() => {
    if (articleId === undefined) {
      console.error("Cannot fetch comments: articleId is undefined.");
      return;
    }
    // Extract comments for the current article from the posts state
    const currentPost = posts.find((post) => post.customId === articleId);
    if (currentPost && currentPost.comments) {
      dispatch(setComments(articleId, currentPost.comments));
    }
  }, [articleId, posts, dispatch]);
  
  const handleSendClick = async () => {
    if (articleId === undefined) {
      console.error("Cannot send comment: articleId is undefined.");
      setError("Unable to send comment. Please try again.");
      return;
    }

    if (inputValue.trim() !== "") {
      const newComment = {
        // id: commentId, // Comment ID will be handled by backend
        author: currentUser.username,
        body: inputValue,
        avatar: currentUser.avatar,
      };
      console.log("avatar", currentUser.avatar);

      try {
        setIsUploading(true);
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Adjust the payload to match backend expectations
            text: newComment.body, // Assuming you're adding a comment's body as text
            commentId:  -1, // Use -1 to indicate a new comment
            avatar: currentUser.avatar,
          }),
        });

        console.log("Server response status:", response.status);
        console.log("Server response headers:", response.headers);

        if (!response.ok) {
          let errorMessage = "Failed to update the comment.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }
          console.error("Error response from server:", errorMessage);
          throw new Error(errorMessage);
        }

        const updatedArticle = await response.json();

        const retrievedLastComment =
          updatedArticle.comments[updatedArticle.comments.length - 1];

        dispatch(addComment(articleId, retrievedLastComment));

        setInputValue("");
        setError("");
        // Optionally, show a success notification
      } catch (error) {
        console.error("Error updating comment:", error);
        setError("Failed to update comment. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditedCommentBody("");
  };

  const getCommentAuthor = async (articleId, commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/getCommentAuthor/${articleId}/${commentId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get comment author.");
      }

      const data = await response.json();
      return data.username; // This will be the author's username
    } catch (error) {
      console.error("Error getting comment author:", error);
      return null; // Handle the error or return a default value
    }
  };

  const handleEdit = (comment) => {
    setEditingCommentId(comment.customId); // Set the ID of the comment being edited
    setEditedCommentBody(comment.body); // Load the current comment body into the edit input
  };
  
  const handleEditSave = async (commentId) => {
    const authorUsername = await getCommentAuthor(articleId, commentId);
  
    if (authorUsername !== currentUser.username) {
      alert("You cannot edit someone else's comment.");
      setEditingCommentId(null);
      setEditedCommentBody("");
      return;
    }
  
    if (editedCommentBody.trim() !== "") {
      try {
        setIsUploading(true);
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: editedCommentBody,
            commentId: commentId, // Only update the specific comment by ID
            avatar: currentUser.avatar,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update the comment.");
        }
  
        const updatedArticle = await response.json();
  
        // Update the specific comment in the Redux state
        const updatedComments = comments.map((comment) =>
          comment.customId === commentId
            ? { ...comment, body: editedCommentBody }
            : comment
        );
  
        dispatch(setComments(articleId, updatedComments));
  
        setEditingCommentId(null);
        setEditedCommentBody("");
      } catch (error) {
        console.error("Error updating comment:", error);
        setError("Failed to update comment. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };
  

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.avatar} alt="" />
        <input
          type="text"
          placeholder="Write a comment"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="form-control mr-2"
          style={{ height: "30px", borderRadius: "20px" }}
        />
        <CommentButton onClick={handleSendClick} disabled={isUploading}>
          {isUploading ? "Sending..." : "Comment"}
        </CommentButton>
      </div>
      {error && <div className="error-message">{error}</div>}
      {comments.map((comment) => (
        <div key={comment.customId} className="comment">
          <img src={comment.avatar} alt="" />
          <div className="info">
            <span>{comment.author}</span>
            {editingCommentId === comment.customId ? (
              <input
                type="text"
                value={editedCommentBody}
                onChange={(e) => setEditedCommentBody(e.target.value)}
                className="form-control mr-2"
                style={{ height: "30px", borderRadius: "20px" }}
              />
            ) : (
              <p>{comment.body}</p>
            )}
          </div>
          <div className="actions">
            {editingCommentId === comment.customId ? (
              <>
                <ActionButton onClick={() => handleEditSave(comment.customId)}>
                  Save
                </ActionButton>
                <ActionButton onClick={handleEditCancel}>Cancel</ActionButton>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span className="date">
                  {formatDistanceToNow(new Date(comment.date), {
                    addSuffix: true,
                  })}
                </span>
                <EditIcon
                  onClick={() => handleEdit(comment)}
                  style={{ cursor: "pointer", marginTop: "5px" }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;
