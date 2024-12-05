import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import PostLogin from "./pages/post-login/postLogin"; // Import your PostLogin component
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import "./style.scss";
import { useState, useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { createGlobalStyle } from "styled-components";
import { FilterTermContext } from "./context/FilterTermContext";
import { useSelector } from "react-redux";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
  }
`;

const Layout = () => (
  <div className="theme-light">
    <GlobalStyle />
    <Navbar />
    <Row className="d-flex">
      <Col
        xs={{ span: 12, order: "1" }}
        md={{ span: 3, order: "1" }}
        className="px-0"
      >
        <LeftBar />
      </Col>
      <Col
        xs={{ span: 12, order: "3" }}
        md={{ span: 6, order: "2" }}
        className="px-0"
      >
        <Outlet />
      </Col>
      <Col
        xs={{ span: 12, order: "2" }}
        md={{ span: 3, order: "3" }}
        className="px-0"
      >
        <RightBar />
      </Col>
    </Row>
    {/* <div className="d-flex">
      <LeftBar />
      <div style={{ flex: 6 }}>
        <Outlet />
      </div>
      <RightBar />
    </div> */}
  </div>
);

const ProtectedRoute = () => {
  const { currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <Layout />; // Render children inside the Layout
};

const CheckLogin = ({ children }) => {
  const { currentUser } = useSelector((state) => state.auth);

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return children; // Render children inside the Layout
};

function App() {
  const { currentUser } = useSelector((state) => state.auth);
  const { darkMode } = useContext(DarkModeContext);
  const [filterTerm, setFilterTerm] = useState("");

  return (
    <FilterTermContext.Provider value={{ filterTerm, setFilterTerm }}>
      <Router>
        <Routes>
          {/* Unprotected Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="post-login" element={<PostLogin />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={currentUser ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Home />} />
            <Route path="profile/:user" element={<Profile />} />
          </Route>
          {/* Catch-all redirect to force users to login if they're not authenticated */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </FilterTermContext.Provider>
  );
}

export default App;