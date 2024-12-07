import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { addPost, setPosts } from "../../actions/postsActions";
import { selectPosts } from "../../reducer/postsReducer";
import { API_BASE_URL } from "../../config/config";
import styled from "styled-components";
import { PhotoCamera } from "@mui/icons-material"; // Import the PhotoCamera icon
import "./share.scss";

// Styled Components for the buttons
const BaseButton = styled.button`
  width: auto;
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

const CancelButton = styled(BaseButton)`
  color: black;
  background-color: #e3e0e0;

  &:hover {
    background-color: #dedada;
  }
`;

const PostButton = styled(BaseButton)`
  background-color: #938eef;
  color: white;

  &:hover {
    background-color: #7a75d6;
  }
`;

const Share = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const posts = useSelector(selectPosts);

  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const clearInputText = () => {
    setInputText("");
    setSelectedImage(null);
    setUploadedFile(null);
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG and PNG are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5 MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setUploadedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchCurrentUserPosts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/articles?username=${currentUser.username}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      dispatch(setPosts(data.articles)); // Update posts in Redux store
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handlePostClick = () => {
    if (inputText.trim() === "" && !uploadedFile) {
      setError("Please enter some text or upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("text", inputText);
    if (uploadedFile) {
      formData.append("image", uploadedFile);
    }

    setIsUploading(true);

    fetch(`${API_BASE_URL}/article`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            const errorMsg = data.error || "Failed to create article.";
            throw new Error(errorMsg);
          });
        }
        return response.json();
      })
      .then((data) => {
        const savedArticle = data.articles[0];
        const newPost = {
          author: savedArticle.author,
          avatar: currentUser.avatar,
          text: savedArticle.text,
          image: savedArticle.image,
          date: new Date(savedArticle.date).toISOString(),
          customId: posts[0] && posts[0].customId ? posts[0].customId + 1 : 1,
        };
        dispatch(addPost(newPost));
        clearInputText();

        // Fetch updated posts
        fetchCurrentUserPosts();
      })
      .catch((error) => {
        console.error("Error creating new article:", error);
        setError(error.message);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img src={currentUser.avatar} alt="" />
          <input
            type="text"
            placeholder={`What's on your mind, ${currentUser.username}?`}
            value={inputText}
            onChange={handleInputChange}
          />
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleImageChange}
              accept="image/*"
            />
            <label htmlFor="file">
              <div className="item">
                <PhotoCamera />
                <span>Add Image</span>
                {uploadedFile && <span> ({uploadedFile.name})</span>}
              </div>
            </label>
          </div>
          <div className="right">
            <PostButton onClick={handlePostClick} disabled={isUploading}>
              {isUploading ? "Posting..." : "Post"}
            </PostButton>
            <CancelButton onClick={clearInputText} disabled={isUploading}>
              Cancel
            </CancelButton>
          </div>
        </div>
        {selectedImage && (
          <div className="image-preview">
            <img src={selectedImage} alt="Preview" className="preview-img" />
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Share;
