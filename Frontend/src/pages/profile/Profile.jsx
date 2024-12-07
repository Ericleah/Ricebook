// Profile.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { signInWithPopup } from "firebase/auth";
import { login } from "../../actions/authActions";
import styled from "styled-components";
import { API_BASE_URL } from "../../config/config";
import { auth, googleProvider } from "../../firebase"; // Import the initialized auth & provider

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

const EditButton = styled(BaseButton)`
  color: white;
  background-color: #938eef; // Mimicking Bootstrap btn-primary color
  margin-right: 5px;
  
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
  background-color: #d36c5c; // Color for Unlink Accounting button

  &:hover {
    background-color: #a22b2b;
  }
`;

const Profile = () => {
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    dob: "",
    phone: "",
    zipcode: "",
    avatar: "",
  });
  const [error, setError] = useState("");

  // Linking/unlinking state
  const [isAccountingLinked, setIsAccountingLinked] = useState(false);
  const [isLinkingInProgress, setIsLinkingInProgress] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = currentUser.username;
        console.log("Fetching profile for:", username);

        const fetchJsonData = async (url) => {
          const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }

          return await response.json();
        };

        // Fetch user details
        const [emailData, dobData, phoneData, zipcodeData, avatarData] = await Promise.all([
          fetchJsonData(`${API_BASE_URL}/email/${username}`),
          fetchJsonData(`${API_BASE_URL}/dob/${username}`),
          fetchJsonData(`${API_BASE_URL}/phone/${username}`),
          fetchJsonData(`${API_BASE_URL}/zipcode/${username}`),
          fetchJsonData(`${API_BASE_URL}/avatar/${username}`),
        ]);

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
        setError("Failed to fetch profile data.");
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
        fetch(`${API_BASE_URL}/zipcode`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            zipcode: updatedProfileData.zipcode,
          }),
        }),

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

      setProfileData((prevData) => ({
        ...prevData,
        ...updatedProfileData,
      }));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
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
    formData.append("avatar", file); // Correct field name
  
    console.log("Uploading file:", file); // Log file details
  
    try {
      const response = await fetch(`${API_BASE_URL}/avatar`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
  
      console.log("Server response status:", response.status); // Log status code
      console.log("Server response headers:", response.headers); // Log headers
  
      if (!response.ok) {
        const errorMessage = await response.json();
        console.error("Error response from server:", errorMessage); // Log server error
        throw new Error(errorMessage.error || "Failed to update avatar.");
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
  
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error during upload:", error.message);
      setError("Failed to update avatar. Please try again.");
    }
  };
  
  

  // Function to handle linking accounting
  const handleLinkAccounting = async () => {
    setIsLinkingInProgress(true);
  
    try {
      // Prompt user to sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
  
      const response = await fetch(`${API_BASE_URL}/linkThirdPartyUser`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: googleUser.displayName,
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          uid: googleUser.uid,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setIsAccountingLinked(true);
        dispatch(login(data));
        // Now the user can also login with google next time
      } else {
        console.error("Failed to link accounting:", data.error);
        setError(data.error || "Failed to link accounting. Please try again.");
      }
    } catch (error) {
      console.error("Error linking accounting:", error);
      setError("Failed to link accounting. Please try again.");
    } finally {
      setIsLinkingInProgress(false);
    }
  };

  const handleUnlinkAccounting = async () => {
    console.log("unlink");
    setIsLinkingInProgress(true);
  
    try {
      const response = await fetch(`${API_BASE_URL}/unlinkThirdPartyUser`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: currentUser.username }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // If user was google-only, they're now deleted, so redirect to login
        // If user had normal login credentials, just linked googleId removed, can stay
        console.log("Unlinking success:", data.result);
        if (data.result.includes("deleted")) {
          // If user and profile deleted
          // redirect to login page
          window.location.href = "/login";
        } else {
          // Just unlinked google account
          setIsAccountingLinked(false);
        }
      } else {
        console.error("Failed to unlink accounting:", data.error);
        setError(data.error || "Failed to unlink accounting. Please try again.");
      }
    } catch (error) {
      console.error("Error unlinking accounting:", error);
      setError("Failed to unlink accounting. Please try again.");
    } finally {
      setIsLinkingInProgress(false);
    }
  };
  
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
              onChange={handleFileChange}
              accept="image/*"
            />
            <label htmlFor="profile-pic-input" className="profile-picture-label">
              <AddAPhotoIcon
                // Removed onClick to avoid duplicate uploads
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
            <CakeIcon /> {profileData.dob}
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
          {error && <div className="error-message">{error}</div>}
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
