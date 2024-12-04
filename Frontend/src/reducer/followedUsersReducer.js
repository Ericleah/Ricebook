// followedUsersReducer.js
const initialState = [];

export const addFollowedUser = (user) => ({
  type: "ADD_FOLLOWED_USER",
  payload: user,
});

export const removeFollowedUser = (user) => ({
  type: "REMOVE_FOLLOWED_USER",
  payload: user,
});

export const setFollowedUsers = (users) => ({
  type: "SET_FOLLOWED_USERS",
  payload: users,
});

export const followedUsersReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_FOLLOWED_USER": {
      const newState = [...state, action.payload];
      //console.log("New state after ADD_FOLLOWED_USER:", newState);
      return newState;
    }
    case "REMOVE_FOLLOWED_USER": {
      const newState = state.filter((user) => user.id !== action.payload.id);
      console.log("New state after REMOVE_FOLLOWED_USER:", newState);
      return newState;
    }
    case "SET_FOLLOWED_USERS": {
      console.log("New state after SET_FOLLOWED_USERS:", action.payload);
      return action.payload;
    }
    default:
      return state;
  }
};

export const selectFollowedUsers = (state) => state.followedUsers;
export default followedUsersReducer;