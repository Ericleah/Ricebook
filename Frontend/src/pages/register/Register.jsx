import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from '../../actions/authActions';
import profilePic from "../../assets/profile.png";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap';
import styled from "styled-components";
import "./register.scss";
import $ from 'jquery';
import riceIcon from '../../assets/rice-university-logo.png'; 
import { API_BASE_URL } from '../../config/config.js';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #4a6fa5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #365880;
  }
`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [zipcode, setZipCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const [userNameError, setUserNameError] = useState('');
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [birthdayError, setBirthdayError] = useState("");
  const [zipCodeError, setZipCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();
  const [usernamesFromApi, setUsernamesFromApi] = useState([]);

  useEffect(() => {
    // Fetch the usernames from the provided API
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        const fetchedUsernames = data.map((user) => user.username);
        setUsernamesFromApi(fetchedUsernames);
      })
      .catch((error) => console.error("Error fetching usernames:", error));
  }, []);

  const checkUserName = (inputValue) => {
    if (!(/^[a-z]*$/.test(inputValue[0]))) {
        setUserNameError('Must start with a letter.');
        $('[data-toggle="popover-username"]').popover('show');
    } else if (!(/^[a-z][A-Za-z0-9]*$/.test(inputValue))) {
        setUserNameError('Account name can only contain numbers and characters.');
        $('[data-toggle="popover-username"]').popover('show');
    } else {
        setUserNameError(''); 
    }
  };

  const checkEmail = (emailValue) => {
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailValue))) {
        setEmailError("Please enter a valid email in this format: 1@1.com");
        $('[data-toggle="popover-email"]').popover('show');
    } else {
        setEmailError("");
        $('[data-toggle="popover-email"]').popover('hide');
    }
  };

  const checkPhone = (phoneValue) => {
    if (!(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phoneValue))) {
      setPhoneError("Please enter a valid phone number in this format: 123-456-7890.");
      $('[data-toggle="popover-phone"]').popover('show');
    } else {
      setPhoneError(""); 
      $('[data-toggle="popover-phone"]').popover('hide');
    }
  };

  const checkAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    
    const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

    if (age < 18) {
        setBirthdayError("Age must be older than 18.");
    } else {
        setBirthdayError("");
    }
  };

  const checkZipCode = (zipValue) => {
    if (!(/^\d{5}(-\d{4})?$/.test(zipValue))) {
        setZipCodeError("Please enter a valid 5-digit zipcode in this format: 77030 or 77030-1234.");
    } else {
      setZipCodeError(""); 
    }
  };

  const checkPassword = (passwordValue) => {
    if (passwordValue === '') {
        setPasswordError("Enter password.");
    } else {
        setPasswordError(""); 
    }
  };

  const checkConfirmPassword = (confirmPassword) => {
    if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
    } else {
        setConfirmPasswordError(""); 
    }
  };

  useEffect(() => {
    $('[data-toggle="popover-username"], [data-toggle="popover-email"], [data-toggle="popover-phone"], [data-toggle="popover-birthday"], [data-toggle="popover-zipcode"]'
      , '[data-toggle="popover-password"], [data-toggle="popover-confirmpassword"]').popover();
    
    if (userNameError) {
      $('[data-toggle="popover-username"]').popover('show');
    } else {
      $('[data-toggle="popover-username"]').popover('hide');
    }
    
    if (emailError) {
      $('[data-toggle="popover-email"]').popover('show');
    } else {
      $('[data-toggle="popover-email"]').popover('hide');
    }
  
    if (phoneError) {
      $('[data-toggle="popover-phone"]').popover('show');
    } else {
      $('[data-toggle="popover-phone"]').popover('hide');
    }

    if (birthdayError) {
      $('[data-toggle="popover-birthday"]').popover('show');
    } else {
      $('[data-toggle="popover-birthday"]').popover('hide');
    }

    if (zipCodeError) {
      $('[data-toggle="popover-zipcode"]').popover('show');
    } else {
      $('[data-toggle="popover-zipcode"]').popover('hide');
    }

    if (passwordError) {
      $('[data-toggle="popover-password"]').popover('show');
    } else {
      $('[data-toggle="popover-password"]').popover('hide');
    }

    if (confirmPasswordError) {
      $('[data-toggle="popover-confirmpassword"]').popover('show');
    } else {
      $('[data-toggle="popover-confirmpassword"]').popover('hide');
    }
    
    return () => {
      // Hide and destroy popovers to avoid memory leaks
      $('[data-toggle="popover-username"], [data-toggle="popover-email"], [data-toggle="popover-phone"], [data-toggle="popover-birthday"], [data-toggle="popover-zipcode"]'
      , '[data-toggle="popover-password"], [data-toggle="popover-confirmpassword"]').popover('hide').popover('dispose');
    };
  }, [username, email, phone, userNameError, emailError, phoneError, birthdayError, zipCodeError, passwordError, confirmPasswordError]);

  const handleNameChange = (e) => {
    const currentValue = e.target.value;
    setUsername(currentValue);
    checkUserName(currentValue);
  };

  const handleEmailChange = (e) => {
    const currentValue = e.target.value;
    setEmail(currentValue);
    checkEmail(currentValue);
  };

  const handlePhoneChange = (e) => {
    const currentValue = e.target.value;
    setPhone(currentValue);
    checkPhone(currentValue);
  };

  const handleZipCodeChange = (e) => {
    const currentValue = e.target.value;
    setZipCode(currentValue);
    checkZipCode(currentValue);
  };

  const handlePasswordChange = (e) => {
    const currentValue = e.target.value;
    setPassword(currentValue);
    checkPassword(currentValue);
  };

  const handleConfirmPasswordChange = (e) => {
    const currentValue = e.target.value;
    setConfirmPassword(currentValue);
    checkConfirmPassword(currentValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !userNameError &&
      !emailError &&
      !phoneError &&
      !birthdayError &&
      !zipCodeError &&
      !passwordError &&
      !confirmPasswordError
    ) {
      const user = {
        username: username,
        email: email,
        phone: phone,
        dob: birthDate,
        zipcode: zipcode,
        password: password,
      };

      //dispatch(register(user));
      try {
        const response = await fetch(
          `${API_BASE_URL}/register`,
          {
            // Replace with your backend URL
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
          }
        );
        console.log("Register")
        const data = await response.json();
        if (response.ok) {
          navigate("/login");
        } else {
          // Handle errors
          console.error("Registration error:", data.error);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  return (
    <div className="register-container">
      <Card>
      <div className="header">
          <img src={riceIcon} alt="Rice University" className="university-logo" />
          <h1>Ricebook</h1>
        </div>
        <h2>Create Your Account</h2>

        <form onSubmit={handleSubmit}>
          <Input type="text" name="username" placeholder="Username" value={username} onChange={handleNameChange} data-toggle="popover-username"
                    data-trigger="manual" 
                    data-content={userNameError}
                    data-placement="top"  />
          <Input type="email" name="email" placeholder="Email" value={email} onChange={handleEmailChange} data-toggle="popover-email"
                    data-trigger="manual" 
                    data-content={emailError}
                    data-placement="top" />
          <Input type="text" name="phone" placeholder="Phone" value={phone} onChange={handlePhoneChange} data-toggle="popover-phone"
                    data-trigger="manual" 
                    data-content={phoneError}
                    data-placement="top"/>
          <Input type="date" name="birthDate" placeholder="Birth Date" value={birthDate} onChange={e => {
                    setBirthDate(e.target.value);
                    checkAge(e.target.value);
                }}
                    data-toggle="popover-birthday"
                    data-trigger="manual" 
                    data-content={birthdayError}
                    data-placement="top"/>
          <Input type="text" name="zipcode" placeholder="Zip Code" value={zipcode} onChange={handleZipCodeChange} data-toggle="popover-zipcode"
                    data-trigger="manual" 
                    data-content={zipCodeError}
                    data-placement="top"/>
          <Input type="password" name="password" placeholder="Password" value={password} onChange={handlePasswordChange} data-toggle="popover-password"
                    data-trigger="manual" 
                    data-content={passwordError}
                    data-placement="top"/>
          <Input type="password" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={handleConfirmPasswordChange} data-toggle="popover-confirmpassword"
                    data-trigger="manual" 
                    data-content={confirmPasswordError}
                    data-placement="top"/>
          <Button type="submit">Register</Button>
        </form>
        <Link to="/login">Already have an account? Log in</Link>
      </Card>
    </div>
  );
};

export default Register;
