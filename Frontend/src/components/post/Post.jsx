import React, { useState } from 'react';
import './post.scss';
import Comments from '../comments/Comments';

const Post = ({ post }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false); // State to toggle comments visibility

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.postImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === post.postImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleComments = () => {
    setShowComments((prevShowComments) => !prevShowComments);
  };

  // Default comments if none are provided
  const defaultComments = [

  ];

  return (
    <div className="post">
      <div className="post-header">
        <img
          src={post.userImage}
          alt={post.userName}
          className="post-user-image"
        />
        <div className="post-user-info">
          <h5 className="post-user-name">{post.userName}</h5>
          <p className="post-date">{post.date}</p>
        </div>
      </div>
      <div className="post-body">
        <h6 className="post-title">{post.title}</h6>
        <p className="post-desc">{post.body}</p>
        {post.postImages.length > 0 && (
          <div className="post-images">
            {post.postImages.length > 1 && (
              <button onClick={handlePrevImage} className="image-nav-button prev-button">❮</button>
            )}
            <img
              src={post.postImages[currentImageIndex]}
              alt="Post"
              className="post-image"
              draggable="true"
            />
            {post.postImages.length > 1 && (
              <button onClick={handleNextImage} className="image-nav-button next-button">❯</button>
            )}
          </div>
        )}
      </div>
      <div className="post-footer">
        <button className="post-action-button">like</button>
        <button className="post-action-button" onClick={toggleComments}>
          {showComments ? "hide comments" : "show comments"}
        </button>
        <button className="post-action-button">share</button>
        <button className="post-action-button">edit</button>
      </div>
      {/* Conditionally render the Comments component */}
      {showComments && <Comments comments={post.comments || defaultComments} />}
    </div>
  );
};

export default Post;
