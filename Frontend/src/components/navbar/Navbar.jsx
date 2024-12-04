import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { Dropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { FilterTermContext } from "../../context/FilterTermContext";

import { selectUser } from "../../reducer/authReducer";



const Navbar = () => {
  const currentUser = useSelector(selectUser);
  const { toggle, darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { filterTerm, setFilterTerm } = useContext(FilterTermContext);


  const handleProfileIconClick = () => {
    navigate("/profile/${currentUser.id}`");
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowDropdown(false);
  };

  const handleSearchIconClick = () => {
    if (!searchTerm) {
      navigate("/");
    } else {
      setFilterTerm(searchTerm);
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" className="brand">
          <span className="brand-text">Ricebook</span>
        </Link>
        <HomeOutlinedIcon />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />
      </div>
      <div className="search">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={handleInputChange} />
        <SearchOutlinedIcon
          onClick={handleSearchIconClick}
          style={{ cursor: "pointer", color: "#938eef" }}
        />
      </div>
      <div className="right">
        <div className="profileicon">
          <PersonOutlinedIcon onClick={handleProfileIconClick} />
        </div>
        <NotificationsOutlinedIcon />
        <EmailOutlinedIcon />
        <Dropdown>
          <Dropdown.Toggle variant="success" as="span" id="dropdown-profile">
            <div className="user">
              <img src={currentUser.profilePic} alt={currentUser.name} className="profile-pic" />
              {currentUser.name}
            </div>
          </Dropdown.Toggle>
  
          <Dropdown.Menu>
            <Dropdown.Item href={`/profile/${currentUser.id}`}>Profile</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}

export default Navbar;
