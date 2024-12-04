import Stories from "../../components/stories/Stories"
import Posts from "../../components/posts/Posts"
import Share from "../../components/share/Share"
import "./home.scss"
import React, { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import JSONUser from "../../assets/profile.png";
import { useSelector } from 'react-redux'; // Import the useSelector hook
import { selectUser } from "../../reducer/authReducer";  

const Home = () => {
  const currentUser = useSelector(selectUser); // Get the currentUser from Redux
  
  //currentUser.profilePic=JSONUser;
  return (
    <div className="home">
      {/* You can now use currentUser throughout the component or pass it to child components */}
      <Stories user={currentUser}/>
      <Posts user={currentUser}/>
    </div>
  );
}

export default Home;