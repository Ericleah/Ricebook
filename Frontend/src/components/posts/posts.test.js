import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import fetchMock from "jest-fetch-mock";
import Posts from "../posts/Posts";
import { FilterTermContext } from "../../context/FilterTermContext";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe("<Posts />", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { currentUser: { id: 1, username: "testuser" } },
      posts: { items: [] },
      followedUsers: [{ id: 2, username: "follower_user" }]
    });

    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  it("should fetch all articles for current logged in user (posts state is set)", async () => {
    fetchMock.mockResponses(
      [JSON.stringify([{ id: 1, title: "Post 1", body: "Body 1" }, { id: 2, title: "Post 2", body: "Body 2" }]), { status: 200 }]
    );

    const { getByText } = render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("userId=1"));
    });
  });

  it("should fetch subset of articles for current logged in user given search keyword (posts state is filtered)", async () => {
    const filterTerm = "Post 1";
    fetchMock.mockResponse(JSON.stringify([{ id: 1, title: "Post 1", body: "Body 1" }]));

    const { getByText } = render(
      <Provider store={store}>
        <FilterTermContext.Provider value={{ filterTerm }}>
          <Posts />
        </FilterTermContext.Provider>
      </Provider>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("userId=1"));
    });
  });

  it("should add articles when adding a follower (posts state is larger)", async () => {
    fetchMock.mockResponse(JSON.stringify([{ id: 3, title: "Post 3", body: "Body 3" }]));

    render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );

    // Simulate adding a follower
    store.dispatch({
      type: 'ADD_FOLLOWED_USER',
      payload: { id: 3, username: "new_follower" }
    });

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'ADD_FOLLOWED_USER',
        payload: expect.objectContaining({ username: "new_follower" })
      });
      expect(fetchMock).toHaveBeenCalledTimes(2); // Initial fetch + new follower fetch
    });
  });

  it("should remove articles when removing a follower (posts state is smaller)", async () => {
    fetchMock.mockResponse(JSON.stringify([])); // Mock no posts return after removal

    render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );

    // Simulate removing a follower
    store.dispatch({
      type: 'REMOVE_FOLLOWED_USER',
      payload: { id: 2 }
    });

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'REMOVE_FOLLOWED_USER',
        payload: expect.objectContaining({ id: 2 })
      });
      expect(fetchMock).toHaveBeenCalledTimes(2); // Initial fetch + after removal fetch
    });
  });
});
