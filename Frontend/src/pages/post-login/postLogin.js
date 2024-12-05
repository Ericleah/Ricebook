import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../actions/authActions";
import { selectUser } from "../../reducer/authReducer";
import { API_BASE_URL } from "../../config/config";

const PostLogin = () => {
  //const { username } = useParams(); // Extract the username from the URL parameter
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    // Function to check user session
    const checkUserSession = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/checkThirdPartyLogin`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          //avatar
          dispatch(login(data));
          navigate("/"); // or wherever you want to redirect after login
        } else {
          navigate("/login"); // Redirect to login page if no session
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      }
    };

    // Check user session when the component mounts
    checkUserSession();
  }, [dispatch, navigate, currentUser]); // Include username as a dependency

  return <div>Loading...</div>; // Or any loading indicator
};

export default PostLogin;