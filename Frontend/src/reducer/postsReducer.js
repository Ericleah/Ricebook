// postsReducer.js or in your slice

import { ADD_POST } from "../actions/postsActions.js";
import { SET_POSTS } from "../actions/postsActions.js";

const initialState = {
  posts: [],
  // ... other state
};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    case SET_POSTS:
      return {
        ...state,
        posts: action.payload,
      };
    // ... other case handlers
    default:
      return state;
  }
};

export const selectPosts = (state) => state.posts.posts;
export default postsReducer;