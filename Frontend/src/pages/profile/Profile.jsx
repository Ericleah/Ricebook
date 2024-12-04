import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditProfileModal from "../../components/modal/EditProfileModal";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { login } from "../../actions/authActions";
import styled from "styled-components";
import defaultProfilePic from "../../assets/profile.png";
import "./profile.scss";

const BaseButton = styled.button`
  width: auto;
  border: none;
  border-radius: 5px;
  padding: 5px 15px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
`;

const EditButton = styled(BaseButton)`
  color: white;
  background-color: #938eef; // Mimicking Bootstrap btn-danger color
  margin-right: 5px; // Add some margin to the right of the Cancel button

  &:hover {
    background-color: #7a75d6; // Darker shade for hover effect
  }
`;

const Profile = ({ setShowBars }) => {
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    // Hide left and right bars when the profile page is loaded
    setShowBars(false);

    // Cleanup function to show bars again when the component is unmounted
    return () => {
      setShowBars(true);
    };
  }, [setShowBars]);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUpdateProfile = (formData) => {
    dispatch(login({
      ...currentUser,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      zipcode: formData.zipcode
    }));
    setIsModalOpen(false);
  };


  return (
    <div className="profile-container">
      <Link to="/">
        <ArrowBackIosIcon className="back-button" />
      </Link>
      <div className="profile-header">
        <div className="profile-pic-wrapper">
          <img
            src={currentUser.profilePic || defaultProfilePic}
            alt={currentUser.username}
            className="profile-pic"
          />
          <input 
            type="file" 
            id="profile-pic-input" 
            style={{ display: 'none' }} 
            accept="image/*" 
          />
          <label htmlFor="profile-pic-input" className="profile-picture-label">
            <AddAPhotoIcon style={{fontSize:18}}/>
          </label>
        </div>
      </div>
      <div className="profile-info">
        <h3><strong>{currentUser.username}</strong></h3>
        <p><EmailOutlinedIcon /> {currentUser.email}</p>
        <p><PhoneIcon /> {currentUser.phone}</p>
        <p><PlaceIcon />{currentUser.zipcode}</p>
        <p><VisibilityOffIcon />{currentUser.password && '*'.repeat(currentUser.password.length)}</p>
        <EditButton onClick={handleEditClick}>
          Edit
        </EditButton>
      </div>
      <EditProfileModal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        user={currentUser}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
};

export default Profile;