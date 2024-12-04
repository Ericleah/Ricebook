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

const userImages = [
  "https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1600"
];

const RightBar = () => {
  const currentUser = useSelector(selectUser);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [newFollowers, setNewFollowers] = useState([]);
  const [inputName, setInputName] = useState("");
  const currentUserID = currentUser.id;
  const dispatch = useDispatch();
  const followedUsers = useSelector(selectFollowedUsers);

  const [message, setMessage] = useState(null);
  const [initialAssigned, setInitialAssigned] = useState(false);

  useEffect(() => {
    const totalUsers = 11;

    if (currentUserID <= totalUsers && !initialAssigned) {
      let initialFollowedUserIds;
      if (currentUserID === 11) {
        initialFollowedUserIds = [0];
      } else {
        initialFollowedUserIds = [
          (currentUserID % totalUsers) + 1,
          ((currentUserID + 1) % totalUsers) + 1,
          ((currentUserID + 2) % totalUsers) + 1,
        ];
      }

      fetch("https://jsonplaceholder.typicode.com/users")
        .then((response) => response.json())
        .then((data) => {
          const initialFollowedUsers = data.filter((user) =>
            initialFollowedUserIds.includes(user.id)
          );

          setOnlineFriends(initialFollowedUsers.map((user) => user.id));
          dispatch(setFollowedUsers(initialFollowedUsers));
          setInitialAssigned(true);
        });
    } else {
      setOnlineFriends(followedUsers.map((user) => user.id));
      dispatch(setFollowedUsers(followedUsers));
    }
  }, [currentUserID, dispatch, followedUsers, initialAssigned]);

  const handleUnfollow = (userToUnfollow) => {
    dispatch(removeFollowedUser(userToUnfollow));
    setOnlineFriends((prevFriends) =>
      prevFriends.filter((friend) => friend !== userToUnfollow)
    );
    setNewFollowers((prevFollowers) =>
      prevFollowers.filter((follower) => follower !== userToUnfollow)
    );
  };

  const handleAddFriend = async () => {
    if (inputName.trim() !== "") {
      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?username=${inputName}`
        );
        const newUser = await response.json();

        if (newUser && newUser.length > 0) {
          const userWithHeadline = {
            ...newUser[0],
            headline: "This is a default headline for a new friend.",
          };
          setNewFollowers((prevFollowers) => [
            ...prevFollowers,
            userWithHeadline,
          ]);
          dispatch(addFollowedUser(userWithHeadline));
          setInputName("");
          setMessage(null);
        } else {
          setMessage("User not found.");
        }
      } catch (error) {
        setMessage("There was an error fetching the user. Please try again.");
      }
    }
  };

  const allFriends = [...onlineFriends, ...newFollowers];

  return (
    <div className="rightBar d-flex flex-column p-2 bg-light border-left">
      <div className="customContainer">
        {message && <div className="alert alert-warning">{message}</div>}
        <h5 className="customTitle text-muted mb-3">Online Friends</h5>
        {allFriends.map((userId, index) => {
          const user = followedUsers.find((u) => u.id === userId);
          const userImage = userImages[userId % userImages.length];

          if (!user) {
            return null;
          }

          return (
            <div className="mb-3 border-bottom pb-3" key={userId}>
              <div className="d-flex align-items-center">
                <img
                  src={userImage}
                  alt=""
                  className="rounded-circle mr-2"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="ml-3">
                  <p className="mb-1 font-weight-bold" style={{ fontSize: "16px" }}>
                    {user.username}
                  </p>
                  <UnfollowButton onClick={() => handleUnfollow(user)}>
                    Unfollow
                  </UnfollowButton>
                </div>
              </div>
            </div>
          );
        })}
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