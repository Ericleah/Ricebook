import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import { useDispatch } from 'react-redux';
import { login } from '../../actions/authActions'; 
import profilePic from '../../assets/profile.png';
import riceIcon from '../../assets/rice-university-logo.png';

// Styled Components for the buttons
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

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users?username=${username}`
    );
    const users = await response.json();
    const user = users[0];

    if (user && user.address.street === password) {
      // Transform the user object
      user.zipcode = user.address.zipcode;
      user.password = user.address.street;
      delete user.address;

      // Check if the user exists in the local JSON file
      const localUser = users.find(u => u.username === username);

      dispatch(login({
        id: user.id,
        username: username,
        password: user.password,
        zipcode: user.zipcode,
        email: user.email,
        phone: user.phone,
        profilePic: localUser ? userImages[user.id % userImages.length] : profilePic,
        // ... other attributes
      }));
      navigate("/"); 
    } else {
      setErrorMessage("Incorrect username or password");
    }
  };

  return (
    <div className="login-container">
      <Card>
        <div className="header">
          <img src={riceIcon} alt="Rice University" className="university-logo" />
          <h1>Ricebook</h1>
        </div>
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <Button type="submit">Login</Button>
        </form>
        <Link to="/register">Need an account? Register here</Link>
      </Card>
    </div>
  );
};

export default Login;