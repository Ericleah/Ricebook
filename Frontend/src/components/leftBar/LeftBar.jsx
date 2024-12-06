// LeftBar.jsx
import React, { useEffect, useState } from "react";
import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Market from "../../assets/3.png";
import Watch from "../../assets/4.png";
import { useSelector } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import styled from "styled-components";

// Styled Components for the buttons
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

const ActionButton = styled(BaseButton)`
  color: white;
  background-color: #938eef;

  &:hover {
    background-color: #7a75d6;
  }
`;

const CancelButton = styled(BaseButton)`
  color: black;
  background-color: #e3e0e0; // Mimicking Bootstrap btn-danger color
  margin-right: 5px; // Add some margin to the right of the Cancel button

  &:hover {
    background-color: #dedada; // Darker shade for hover effect
  }
`;

// MenuItem Component
const MenuItem = ({ icon, label }) => (
  <div className="item">
    <img src={icon} alt={label} />
    <span>{label}</span>
  </div>
);

const LeftBar = () => {
  const currentUser = useSelector(selectUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editableHeadline, setEditableHeadline] = useState("");
  const [userHeadline, setUserHeadline] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:3001"; // Ensure this matches your backend URL

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/avatar/${currentUser.username}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setProfilePic(data.avatar || "/default-profile.png"); // Fallback to a default image
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfilePic("/default-profile.png"); // Fallback to a default image
      }
    };

    const fetchUserHeadline = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/headline/${currentUser.username}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch headline");
        }

        const data = await response.json();

        setUserHeadline(data.headline || "No headline available");
        setEditableHeadline(data.headline || "");
      } catch (error) {
        console.error("Error fetching headline:", error);
        setUserHeadline("No headline available");
      }
    };

    if (currentUser && currentUser.username) {
      fetchUserProfile();
      fetchUserHeadline();
    }
  }, [currentUser]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleHeadlineChange = (e) => {
    setEditableHeadline(e.target.value);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/headline`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headline: editableHeadline }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Failed to update headline.";
        throw new Error(errorMsg);
      }

      const updatedData = await response.json();

      setIsEditing(false);
      setEditableHeadline(updatedData.headline);
      setUserHeadline(updatedData.headline);
      setError("");
    } catch (error) {
      console.error("Error updating headline:", error);
      setError(error.message);
    }
  };

  const handleCancel = () => {
    setEditableHeadline(userHeadline);
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          {/* User Information */}
          <div className="user">
            <img src={profilePic} alt={currentUser.username} />
            <span>{currentUser.username}</span>
            <div className="statusHeadline">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editableHeadline}
                    onChange={handleHeadlineChange}
                    placeholder="Update your status"
                  />
                  <div className="buttonGroup">
                    <ActionButton onClick={handleSave}>Save</ActionButton>
                    <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                  </div>
                </>
              ) : (
                <>
                  <span>{userHeadline}</span>
                  <ActionButton onClick={handleEditClick}>
                    Edit Status
                  </ActionButton>
                </>
              )}
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>

          {/* Menu Items */}
          <MenuItem icon={Friends} label="Friends" />
          <MenuItem icon={Groups} label="Groups" />
          <MenuItem icon={Market} label="Market" />
          <MenuItem icon={Watch} label="Watch" />
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
