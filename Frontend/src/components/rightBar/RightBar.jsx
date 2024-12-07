import React, { useEffect, useState } from "react";
import "./rightBar.scss";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import {
  addFollowedUser,
  removeFollowedUser,
  setFollowedUsers,
} from "../../reducer/followedUsersReducer";
import { selectFollowedUsers } from "../../reducer/followedUsersReducer";
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

const AddButton = styled(BaseButton)`
  color: white;
  background-color: #938eef;
  margin-right: 5px;

  &:hover {
    background-color: #7a75d6;
  }
`;

const UnfollowButton = styled(BaseButton)`
  color: white;
  background-color: #d36c5c;
  margin-right: 5px;

  &:hover {
    background-color: #a22b2b;
  }
`;

const RightBar = () => {
  const currentUser = useSelector(selectUser);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [newFollowers, setNewFollowers] = useState([]);
  const [inputName, setInputName] = useState("");
  const dispatch = useDispatch();
  const followedUsers = useSelector(selectFollowedUsers);
  const [followedUsersHeadline, setfollowedUsersHeadline] = useState([]);
  const [followedUsersObjects, setfollowedUsersObjects] = useState([]);

  const [message, setMessage] = useState(null);

  const getFollowingDetails = async (followingUsernames) => {
    // Fetch headlines and avatars for each user
    return Promise.all(
      followingUsernames.map(async (username) => {
        const [headlineResponse, avatarResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/headline/${username}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `${API_BASE_URL}/avatar/${username}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          ),
        ]);

        const headlineData = headlineResponse.ok
          ? await headlineResponse.json()
          : { headline: "No headline available" };
        const avatarData = avatarResponse.ok
          ? await avatarResponse.json()
          : { avatar: "" };

        return {
          username: username,
          headline: headlineData.headline,
          avatar: avatarData.avatar,
        };
      })
    );
  };

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/following/${currentUser.username}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch following users.");
        }

        const data = await response.json();
        const followingUsernames = data.following;

        const usersWithDetails = await getFollowingDetails(followingUsernames);

        dispatch(setFollowedUsers(usersWithDetails));
        setfollowedUsersObjects(usersWithDetails);
      } catch (error) {
        console.error("Error fetching following users:", error);
      }
    };

    if (currentUser && currentUser.username) {
      fetchFollowingUsers();
    }
  }, []);

  const handleUnfollow = async (userToUnfollow) => {
    try {
      const unfollowResponse = await fetch(
        `${API_BASE_URL}/following/${userToUnfollow.username}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!unfollowResponse.ok) {
        const errorData = await unfollowResponse.json();
        throw new Error(errorData.error || "Failed to unfollow the user.");
      }
  
      const updatedUserInfo = await unfollowResponse.json();
  
      // Fetch updated details for the remaining followed users
      const updatedFollowedDetails = await getFollowingDetails(updatedUserInfo.following);
  
      // Update Redux store and local state
      dispatch(setFollowedUsers(updatedFollowedDetails));
      setfollowedUsersObjects(updatedFollowedDetails);
  
      // Optionally, update related states like `onlineFriends` or `newFollowers`
      setOnlineFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.username !== userToUnfollow.username)
      );
      setNewFollowers((prevFollowers) =>
        prevFollowers.filter((follower) => follower.username !== userToUnfollow.username)
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
      setMessage("Failed to unfollow user. Please try again.");
    }
  };
  

  const handleAddFriend = async () => {
    if (inputName.trim() !== "") {
      try {
        const followResponse = await fetch(
          `${API_BASE_URL}/following/${inputName}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!followResponse.ok) {
          throw new Error("Failed to add to following list.");
        }

        const updatedUserInfo = await followResponse.json();

        dispatch(
          setFollowedUsers(await getFollowingDetails(updatedUserInfo.following))
        );

        setInputName("");
      } catch (error) {
        setMessage("There was an error. Please try again.");
        console.error("Error:", error);
      }
    }
  };

  const allFriends = [...onlineFriends, ...newFollowers];

  return (
    <div className="rightBar d-flex flex-column p-2 bg-light border-left">
      <div className="customContainer">
        {message && <div className="alert alert-warning">{message}</div>}
        <h5 className="customTitle text-muted mb-3">Online Friends</h5>
        {followedUsers.map((user, index) => (
          <div className="mb-3 border-bottom pb-3" key={index}>
            <div className="d-flex">
              <img
                src={user.avatar}
                className="rounded-circle mr-2"
                style={{ width: "40px", height: "40px" }}
              />
              <div>
                <p className="mb-1" style={{ fontSize: "15px" }}>
                  {user.username}
                </p>
                <p className="text-muted" style={{ fontSize: "12px" }}>
                  {user.headline}
                </p>
                <div className="mt-0">
                  <UnfollowButton onClick={() => handleUnfollow(user)}>
                    Unfollow
                  </UnfollowButton>
                </div>
              </div>
            </div>
          </div>
        ))}
        <h5 className="customTitle text-muted mb-3 mt-4">Add New Friend</h5>
        <div className="mb-3 d-flex">
          <input
            type="text"
            value={inputName}
            onChange={(e) => {
              setInputName(e.target.value);
              setMessage(null);
            }}
            placeholder="Enter friend's name"
            className="form-control mr-2"
            style={{ height: "30px", borderRadius: "20px" }}
          />
          <AddButton onClick={handleAddFriend}>Add</AddButton>
        </div>
      </div>
    </div>
  );
};
export default RightBar;