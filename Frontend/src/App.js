import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
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

const Layout = ({ showBars }) => (
  <div className="theme-light">
    <GlobalStyle />
    <Navbar />
    <Row className="d-flex">
      {showBars && (
        <Col
          xs={{ span: 12, order: "1" }}
          md={{ span: 3, order: "1" }}
          className="px-0"
        >
          <LeftBar />
        </Col>
      )}
      <Col
        xs={{ span: 12, order: showBars ? "3" : "1" }}
        md={{ span: showBars ? 6 : 12, order: "2" }}
        className="px-0"
      >
        <Outlet />
      </Col>
      {showBars && (
        <Col
          xs={{ span: 12, order: "2" }}
          md={{ span: 3, order: "3" }}
          className="px-0"
        >
          <RightBar />
        </Col>
      )}
    </Row>
  </div>
);

const ProtectedRoute = ({ showBars }) => {
  const { currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <Layout showBars={showBars} />; // Render children inside the Layout
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
  const [showBars, setShowBars] = useState(true);

  return (
    <FilterTermContext.Provider value={{ filterTerm, setFilterTerm }}>
      <Router>
        <Routes>
          {/* Unprotected Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={currentUser ? <ProtectedRoute showBars={showBars} /> : <Navigate to="/login" />}
          >
            <Route index element={<Home />} />
            <Route path="profile/:id" element={<Profile setShowBars={setShowBars} />} />
          </Route>

          {/* Catch-all redirect to force users to login if they're not authenticated */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </FilterTermContext.Provider>
  );
}

export default App;