import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { BrowserRouter as Router } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';
import Login from '../login/Login';
import authReducer from '../../reducer/authReducer';
import { login, logout } from '../../actions/authActions';
import { add } from 'date-fns';

describe("Login Component - Authentication Validation", () => {
  let store;

  beforeEach(() => {
    fetchMock.resetMocks();
    const rootReducer = combineReducers({
      auth: authReducer
    });
    store = createStore(rootReducer, applyMiddleware(thunk));
  });

  it("should log in a previously registered user (login state should be set)", async () => {
    const initialState = {
      auth: {
        currentUser: null,
        isLoggedIn: true,
        profilePic: null,
      },
    };
    const store = createStore(authReducer, initialState);

    fetchMock.mockResponseOnce(JSON.stringify({ id: 1, username: "testuser", address: { street: "password", zipcode: "12345" } }));

    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isLoggedIn).toBe(true);
    });
  });

  it("should not log in an invalid user (error state should be set)", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 404 });

    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "invaliduser" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "invalidpassword" } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Incorrect username or password")).toBeTruthy();
    });
  });

  it("should log out a user (login state should be cleared)", async () => {
    store.dispatch(login({ username: "testuser", id: 1 }));

    await waitFor(() => {
      expect(store.getState().auth.isLoggedIn).toBe(true);
    });

    store.dispatch(logout());

    await waitFor(() => {
      expect(store.getState().auth.isLoggedIn).toBe(false);
    });
  });
  test('dispatches login action on correct login', async () => {
    const mockUser = {
        id: 1,
        username: 'correctuser',
        address: { street: 'correctpass', zipcode: '12345' },
        email: 'user@example.com',
        phone: '123-456-7890',
    };

    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve([mockUser]),
        })
    );

    render(
        <Provider store={store}>
            <Router>
                <Login />
            </Router>
        </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'correctuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'correctpass' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(store.getState().auth.isLoggedIn).toBe(true);
  });
});
});
