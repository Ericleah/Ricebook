/* istanbul ignore file */

export const ADD_POST = "ADD_POST";
export const ADD_COMMENT = "ADD_COMMENT";
export const SET_COMMENTS = "SET_COMMENTS";
export const SET_POSTS = "SET_POSTS";

export const addPost = (post) => ({
  type: ADD_POST,
  payload: post,
});

export const setPosts = (posts) => ({
  type: SET_POSTS,
  payload: posts,
});

export const addComment = (comment) => ({
  type: ADD_COMMENT,
  payload: comment,
});

export const setComments = (comments) => ({
  type: SET_COMMENTS,
  payload: comments,
});