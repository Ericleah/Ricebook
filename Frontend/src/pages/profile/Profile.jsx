import React, { useState, useEffect } from "react";

import { Link, Navigate, useNavigate } from "react-router-dom";
import PlaceIcon from "@mui/icons-material/Place";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CakeIcon from "@mui/icons-material/Cake";
import PhoneIcon from "@mui/icons-material/Phone";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import EditProfileModal from "../../components/modal/EditProfileModal";
import "./profile.scss";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { login } from "../../actions/authActions";
import styled from "styled-components";
import { API_BASE_URL } from "../../config/config";

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

const EditButton = styled(BaseButton)`
  color: white;
  background-color: #938eef; // Mimicking Bootstrap btn-danger color
  margin-right: 5px; // Add some margin to the right of the Cancel button

  &:hover {
    background-color: #7a75d6; // Darker shade for hover effect
  }
`;

const LinkButton = styled(BaseButton)`
  color: white;
  background-color: #3b5998; // Color for Link Accounting button
  margin-right: 5px;

  &:hover {
    background-color: #324c85;
  }
`;

const UnlinkButton = styled(LinkButton)`
  width: auto;
  background-color: #d36c5c; // Color for Unlink Accounting button

  &:hover {
    background-color: #a22b2b;
  }
`;

const Profile = () => {
  const currentUser = useSelector(selectUser);

  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Add state variables for linking/unlinking accounting
  const [isAccountingLinked, setIsAccountingLinked] = useState(false);
  const [isLinkingInProgress, setIsLinkingInProgress] = useState(false);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    dob: "",
    phone: "",
    zipcode: "",
    password: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = currentUser.username;
        console.log(username);

        const fetchJsonData = async (url) => {
          const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(
              `Error: ${response.status} - ${response.statusText}`
            );
          }

          return await response.json();
        };

        // Fetch user details (email, phone, etc.)
        const emailData = await fetchJsonData(
          //`https://yw187server-3d9494142af2.herokuapp.com/email/${username}`
          `${API_BASE_URL}/email/${username}`
        );

        const dobData = await fetchJsonData(
          //`https://yw187server-3d9494142af2.herokuapp.com/email/${username}`
          `${API_BASE_URL}/dob/${username}`
        );

        const phoneData = await fetchJsonData(
          //`https://yw187server-3d9494142af2.herokuapp.com/phone/${username}`
          `${API_BASE_URL}/phone/${username}`
        );
        const zipcodeData = await fetchJsonData(
          //`https://yw187server-3d9494142af2.herokuapp.com/zipcode/${username}`
          `${API_BASE_URL}/zipcode/${username}`
        );
        const avatarData = await fetchJsonData(
          `${API_BASE_URL}/avatar/${username}`
        );

        // Update state with the fetched data
        setProfileData({
          username: username,
          email: emailData.email || "",
          dob: dobData.dob || "",
          phone: phoneData.phone || "",
          zipcode: zipcodeData.zipcode || "",
          avatar: avatarData.avatar || "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUpdateProfile = async (formData) => {
    const updatedProfileData = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      zipcode: formData.zipcode,
    };

    try {
      // Make API requests to update user information
      await Promise.all([
        // Update zipcode
        fetch(
          `${API_BASE_URL}/zipcode`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              zipcode: updatedProfileData.zipcode,
            }),
          }
        ),

        // Update email
        fetch(`${API_BASE_URL}/email`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: updatedProfileData.email,
          }),
        }),

        // Update phone
        fetch(`${API_BASE_URL}/phone`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: updatedProfileData.phone,
          }),
        }),
      ]);

      // Create a new object with the updated profile data
      const updatedUser = {
        ...currentUser,
        ...updatedProfileData,
      };

      // Dispatch the updated profile data to Redux
      dispatch(login(updatedUser));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error and show a notification to the user
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file); // Ensure file is captured
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfilePicture(reader.result);
        handleUploadProfilePicture(file); // Call upload function here
      };

      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
  
    console.log("Uploading file:", file); // Log file details
  
    try {
      const response = await fetch(`${API_BASE_URL}/avatar`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
  
      console.log("Server response:", response); // Log raw response
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error response from server:", errorMessage); // Log server error
        throw new Error("Failed to update avatar.");
      }
  
      const updatedData = await response.json();
      console.log("Updated avatar data:", updatedData);
  
      // Update state and Redux store
      dispatch(
        login({
          ...currentUser,
          avatar: updatedData.avatar,
        })
      );
  
      setProfileData((prevData) => ({
        ...prevData,
        avatar: updatedData.avatar,
      }));
    } catch (error) {
      console.error("Error during upload:", error.message);
    }
  };
  

  // Function to handle linking accounting
  const handleLinkAccounting = async () => {
    setIsLinkingInProgress(true);

    try {
      // Replace this with your actual linking logic
      // Example: const response = await fetch("link_accounting_url", { method: "POST" });

      // If linking is successful, update the state
      setIsAccountingLinked(true);
    } catch (error) {
      console.error("Error linking accounting:", error);
    } finally {
      setIsLinkingInProgress(false);
    }
  };

  const handleUnlinkAccounting = async () => {
    console.log("unlink");
    setIsLinkingInProgress(true);

    try {
      const response = await fetch(
        "https://ricebookserveryw187-8fbcb305db50.herokuapp.com/unlinkThirdPartyUser",
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: currentUser.username,
            isThirdPartyUser: currentUser.isThirdPartyUser,
          }),
        }
      );

      console.log(response);

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.statusText}`);
      }

      // Handle successful account deletion
      // Redirect to the login page
      //navigate("/login");
      window.location.href =
        "https://ricebookserveryw187-8fbcb305db50.herokuapp.com/auth/google/callback";
    } catch (error) {
      console.error("Error deleting account:", error);
      // Handle error and show a notification to the user
    } finally {
      setIsLinkingInProgress(false);
    }
  };

  useEffect(() => {}, [profilePicture]);

  return (
    <div className="profile container mt-4">
      <Link to="/">
        <ArrowBackIosIcon className="back-button" />
      </Link>
      <div className="row mt-5">
        <div className="col-12 text-center mt-3">
          <div className="profile-pic-wrapper">
            <img
              src={profileData.avatar}
              alt={currentUser ? profileData.username : "User"}
              className="img-fluid rounded-circle profile-pic"
            />

            <input
              type="file"
              id="profile-pic-input"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e, handleUploadProfilePicture)}
              accept="image/*"
            />
            <label
              htmlFor="profile-pic-input"
              className="profile-picture-label"
            >
              <AddAPhotoIcon
                onClick={handleUploadProfilePicture}
                style={{ fontSize: 18, color: "#938eef" }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4 text-center"></div>
        <div className="col-4 text-center">
          <h3>
            <strong>{profileData.username}</strong>
          </h3>
          <p>
            <EmailOutlinedIcon /> {profileData.email}
          </p>
          <p>
            <CakeIcon />
            {profileData.dob}
          </p>
          <p>
            <PhoneIcon /> {profileData.phone}
          </p>
          <p>
            <PlaceIcon />
            {profileData.zipcode}
          </p>
          {/*<p>
            <VisibilityOffIcon />
            {profileData.password && "*".repeat(profileData.password.length)}
            </p>*/}
          <div>
            <EditButton onClick={handleEditClick}>Edit</EditButton>
          </div>
          {/* Place the Link and Unlink buttons in the same line */}
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ marginTop: "10px" }}
          >
            <div>
              <LinkButton
                onClick={handleLinkAccounting}
                disabled={isLinkingInProgress}
              >
                {isLinkingInProgress ? "Linking..." : "Link Accounting"}
              </LinkButton>
            </div>
            <div>
              <UnlinkButton
                onClick={handleUnlinkAccounting}
                disabled={isLinkingInProgress}
              >
                {isLinkingInProgress ? "Unlinking..." : "Unlink Accounting"}
              </UnlinkButton>
            </div>
          </div>
        </div>
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