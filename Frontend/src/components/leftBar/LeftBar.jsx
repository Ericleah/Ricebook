import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Market from "../../assets/3.png";
import Watch from "../../assets/4.png";
import { useSelector } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { useState, useEffect } from "react";

const MenuItem = ({ icon, label }) => (
  <div className="item">
    <img src={icon} alt={label} />
    <span>{label}</span>
  </div>
);

const LeftBar = () => {
  const currentUser = useSelector(selectUser);
  const [statusHeadline, setStatusHeadline] = useState("");
  const [newHeadline, setNewHeadline] = useState("");

  useEffect(() => {
    const savedHeadline = localStorage.getItem(`headline_${currentUser.id}`);
    if (savedHeadline) {
      setStatusHeadline(savedHeadline);
    } else {
      const fetchHeadline = async () => {
        try {
          if (currentUser.id === 11) {
            setStatusHeadline("Welcome to our platform!");
          } else {
            const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
            const data = await response.json();
            setStatusHeadline(data.company.catchPhrase);
          }
        } catch (error) {
          console.error("Error fetching the headline:", error);
        }
      };

      fetchHeadline();
    }
  }, [currentUser.id]);

  const updateStatusHeadline = () => {
    if (newHeadline) {
      setStatusHeadline(newHeadline);
      localStorage.setItem(`headline_${currentUser.id}`, newHeadline);
      setNewHeadline("");
    }
  };

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <img src={currentUser.profilePic} alt={currentUser.username} />
            <span>{currentUser.username}</span>
            <div className="statusHeadline">
              <span>{statusHeadline}</span>
              <input
                type="text"
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                placeholder="Update your status"
              />
              <button onClick={updateStatusHeadline}>Update Status</button>
            </div>
          </div>
          <MenuItem icon={Friends} label="Friends" />
          <MenuItem icon={Groups} label="Groups" />
          <MenuItem icon={Market} label="Market" />
          <MenuItem icon={Watch} label="Watch" />
        </div>
      </div>
    </div>
  );
};

export default LeftBar;