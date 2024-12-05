import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import "./share.scss";
import { PhotoCamera } from "@mui/icons-material"; // Import the PhotoCamera icon
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { addPost } from "../../actions/postsActions";
import { selectPosts } from "../../reducer/postsReducer";
import { API_BASE_URL } from "../../config/config";

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
  background-color: #e3e0e0; // Mimicking Bootstrap btn-danger color
  margin-right: 5px; // Add some margin to the right of the Cancel button

  &:hover {
    background-color: #dedada; // Darker shade for hover effect
  }
`;

const PostButton = styled(BaseButton)`
  background-color: #938eef; // Mimicking Bootstrap btn-primary color
  color: white;

  &:hover {
    background-color: #7a75d6; // Darker shade for hover effect
  }
`;

const Share = ({ addNewPost }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image
  const [uploadedFile, setUploadedFile] = useState(null); // State to store the uploaded file
  const posts = useSelector(selectPosts);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const clearInputText = () => {
    setInputText("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setUploadedFile(file); // Store the File object
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostClick = () => {
    if (inputText.trim() !== "" || uploadedFile) {
      const formData = new FormData();
      formData.append("text", inputText);
      if (uploadedFile) {
        formData.append("image", uploadedFile); // Use the stored File object
      }

      fetch(`${API_BASE_URL}/article`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          const newPost = {
            author: currentUser.username,
            avatar: currentUser.avatar,
            text: inputText,
            image: data.articles[0].image,
            date: new Date(data.articles[0].date).toISOString(),
            customId: posts[0] && posts[0].customId ? posts[0].customId + 1 : 1,
          };
          dispatch(addPost(newPost));
          clearInputText();
          setSelectedImage(null);
          setUploadedFile(null);
        })
        .catch((error) => {
          console.error("Error creating new article:", error);
        });
    }
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img src={currentUser.avatar} alt="" />
          <input
            type="text"
            width="auto"
            placeholder={`What's on your mind, ${currentUser.username}?`}
            value={inputText}
            onChange={handleInputChange}
            style={{ width: "400px" }} // Adjust the width as needed
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
            />
            <label htmlFor="file">
              <div className="item">
                <PhotoCamera />
                <span>Add Image</span>
                {uploadedFile && <span>({uploadedFile.name})</span>}{" "}
              </div>
            </label>
          </div>
          <div className="right">
            <PostButton onClick={handlePostClick}>Post</PostButton>
            <CancelButton onClick={clearInputText}>Cancel</CancelButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;