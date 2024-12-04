import React from "react";
import { Provider } from "react-redux";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import Profile from "../profile/Profile";
import { login } from "../../actions/authActions";

// Create a mock store
const mockStore = configureStore([]);

describe("Profile Component", () => {
  let store;

  beforeEach(() => {
    const initialState = {
      auth: {
        currentUser: {
          id: 1,
          username: "cw206",
          email: "cw206@rice.edu",
          phone: "1234567890",
          zipcode: "12345",
          password: "password",
          profilePic: null
        }
      }
    };
    store = mockStore(initialState);
    store.dispatch = jest.fn(); // Mock dispatch function
  });

  it("should fetch the logged in user's profile username", () => {
    render(
      <Provider store={store}>
        <Router>
          <Profile setShowBars={() => {}} />
        </Router>
      </Provider>
    );

    const usernameElement = screen.queryByText("cw206");
    expect(usernameElement).not.toBeNull(); // Ensures the element is not null
  });

  it("should display user email, phone, and zipcode", () => {
    render(
      <Provider store={store}>
        <Router>
          <Profile setShowBars={() => {}} />
        </Router>
      </Provider>
    );

    const emailElement = screen.queryByText("cw206@rice.edu");
    expect(emailElement).not.toBeNull();

    const phoneElement = screen.queryByText("1234567890");
    expect(phoneElement).not.toBeNull();

    const zipcodeElement = screen.queryByText("12345");
    expect(zipcodeElement).not.toBeNull();
  });

  it("should display the Edit button", () => {
    render(
      <Provider store={store}>
        <Router>
          <Profile setShowBars={() => {}} />
        </Router>
      </Provider>
    );

    const editButton = screen.queryByRole("button", { name: /edit/i });
    expect(editButton).not.toBeNull();
  });

  it("should open the Edit Profile modal when Edit button is clicked", async () => {
    render(
      <Provider store={store}>
        <Router>
          <Profile setShowBars={() => {}} />
        </Router>
      </Provider>
    );

    const editButton = screen.queryByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    const modalTitle = screen.queryByText("Edit Profile");
    expect(modalTitle).not.toBeNull();
  });
});
