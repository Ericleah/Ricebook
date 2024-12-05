// postsActions.js

export const ADD_POST = "ADD_POST";
export const ADD_COMMENT = "ADD_COMMENT";
export const SET_COMMENTS = "SET_COMMENTS";
export const SET_POSTS = "SET_POSTS";
export const UPDATE_POST = "UPDATE_POST";
export const RESET_COMMENTS = "RESET_COMMENTS";
export const UPDATE_COMMENT = "UPDATE_COMMENT";

export const addPost = (post) => ({
  type: ADD_POST,
  payload: post,
});

export const setPosts = (posts) => ({
  type: SET_POSTS,
  payload: posts,
});

export const updatePost = (updatedPost) => ({
  type: UPDATE_POST,
  payload: updatedPost,
});

/*export const addComment = (comment) => ({
  type: ADD_COMMENT,
  payload: comment,
});

export const setComments = (comments) => ({
  type: SET_COMMENTS,
  payload: comments,
});*/
export const addComment = (articleId, comment) => ({
  type: ADD_COMMENT,
  payload: { articleId, comment },
});

export const setComments = (articleId, comments) => ({
  type: SET_COMMENTS,
  payload: { articleId, comments },
});

export const updateComment = (articleId, commentId, comment) => ({
  type: UPDATE_COMMENT,
  payload: { articleId, commentId, comment },
});

// Action Creator
export const resetComments = () => ({
  type: RESET_COMMENTS,
});