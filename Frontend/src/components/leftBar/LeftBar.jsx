import React, { useEffect, useState } from "react";
import "./leftBar.scss";
import styled from "styled-components";
import { useSelector } from "react-redux";
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

const ActionButton = styled(BaseButton)`
  color: white;
  background-color: #938eef;

  &:hover {
    background-color: #7a75d6;
  }
`;

const LeftBar = () => {
  const currentUser = useSelector(selectUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editableHeadline, setEditableHeadline] = useState(
    currentUser?.headline || ""
  );

  const [userHeadline, setUserHeadline] = useState("");

  useEffect(() => {
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
      }
    };

    if (currentUser && currentUser.username) {
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
      const response = await fetch(
        `${API_BASE_URL}/headline`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ headline: editableHeadline }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update headline.");
      }

      setIsEditing(false);
      const updatedData = await response.json();

      setEditableHeadline(updatedData.headline);
      setUserHeadline(updatedData.headline);
    } catch (error) {
      console.error("Error updating headline:", error);
    }
  };

  const handleCancel = () => {
    // Cancel logic
    setEditableHeadline(userHeadline);
    setIsEditing(false);
  };

  return (
    <div className="leftBar d-flex flex-column p-2 bg-light border-left">
      <div className="customContainer">
        <h5 className="customTitle text-muted mb-3">My Headline</h5>

        {isEditing ? (
          <>
            <input
              type="text"
              value={editableHeadline}
              onChange={handleHeadlineChange}
              placeholder="Enter friend's name"
              className="form-control mr-2"
              style={{ height: "30px", borderRadius: "20px" }}
            />
            <div className="d-flex mt-2">
              <ActionButton onClick={handleSave}>Save</ActionButton>
              <ActionButton
                onClick={handleCancel}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </ActionButton>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              {userHeadline}
            </p>
            <ActionButton onClick={handleEditClick}>Edit Headline</ActionButton>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftBar;