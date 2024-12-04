/* istanbul ignore file */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { addPost } from "../../actions/postsActions";
import "./share.scss";
import PhotoIcon from '@mui/icons-material/Photo';

const Share = () => {
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const clearInputText = () => {
    setInputText("");
    setSelectedImage(null); // Reset the selected image after canceling
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Setting the file name to the state
      setUploadedFileName(file.name);
    }
  };

  const handlePostClick = () => {
    if (inputText.trim() !== "" || selectedImage) {
      // Ensure the post has text, cannot be image only
      const newPost = {
        id: Date.now(),
        userName: currentUser.username,
        userId: currentUser.id,
        userImage: currentUser.profilePic,
        body: inputText,
        postImages: selectedImage ? [selectedImage] : [],
        date: new Date().toLocaleString(),
      };

      dispatch(addPost(newPost));
      clearInputText();
    }
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={currentUser.profilePic}
            alt={currentUser.username}
          />
          <textarea
            className="shareInput"
            placeholder={`What's on your mind, ${currentUser.username}?`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <hr className="shareHr" />
        {selectedImage && (
          <div className="shareImgContainer">
            <img className="shareImg" src={selectedImage} alt="Selected" />
            <span className="shareCancelImg" onClick={() => setSelectedImage(null)}>X</span>
          </div>
        )}
        <div className="shareBottom">
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PhotoIcon style={{ marginRight: 5 }} />
              <span className="shareOptionText">Upload Image</span>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="shareButtons">
            <button className="shareButton" onClick={handlePostClick}>
              Share
            </button>
            <button className="shareButton cancelButton" onClick={clearInputText}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;