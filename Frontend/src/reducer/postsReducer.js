// postsReducer.js or in your slice

import {
  ADD_POST,
  SET_POSTS,
  UPDATE_POST,
  ADD_COMMENT,
  SET_COMMENTS,
  RESET_COMMENTS,
  UPDATE_COMMENT,
} from "../actions/postsActions";

const initialState = {
  posts: [],
  comments: {},
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

    case UPDATE_POST:
      const updatedPosts = state.posts.map((post) =>
        post.customId === action.payload.customId ? action.payload : post
      );
      return {
        ...state,
        posts: updatedPosts,
      };

    case UPDATE_COMMENT:
      const {
        articleId: idForUpdate,
        commentId,
        comment: updatedCommentsArray,
      } = action.payload;

      // Ensure that updatedCommentsArray is an array and has at least one element
      if (
        Array.isArray(updatedCommentsArray) &&
        updatedCommentsArray.length > 0
      ) {
        const updatedComment = updatedCommentsArray[0]; // Assuming the updated comment is the first element

        if (Array.isArray(state.comments[idForUpdate])) {
          const newCommentsArray = state.comments[idForUpdate].map((comment) =>
            comment.customId === commentId ? updatedComment : comment
          );

          return {
            ...state,
            comments: {
              ...state.comments,
              [idForUpdate]: newCommentsArray,
            },
          };
        }
      }
      return state; // Return the state unchanged if conditions aren't met

    case SET_COMMENTS:
      const { articleId: idForSet, comments: setAllComments } = action.payload;

      /*const updatedComment = state.comments[idForSet].map((comment) =>
        comment.customId === updatedComments.comments.customId
          ? updatedComments.comments
          : comment
      );*/

      //const existingComments = state.comments[idForSet] || [];

      return {
        ...state,
        comments: {
          ...state.comments,
          [idForSet]: setAllComments, // Directly assign updatedComments to idForSet
        },
      };

    case ADD_COMMENT:
      const { articleId: idForAddComment, comment: newComment } =
        action.payload;
      // If the article doesn't have any comments yet, initialize its comment array
      const existingComments = state.comments[idForAddComment] || [];
      return {
        ...state,
        comments: {
          ...state.comments,
          [idForAddComment]: [...existingComments, newComment],
        },
      };

    case RESET_COMMENTS:
      return {
        ...state,
        comments: [], // Reset comments to an empty array
      };
    default:
      return state;
  }
};

//export const selectPosts = (state) => state.posts.posts;
export const selectPosts = (state) => state.posts.posts;
export const selectComments = (state, articleId) => {
  const commentsByArticle = state.posts.comments[articleId];
  return commentsByArticle || []; // Return an empty array if no comments are found
};
//export const selectComments = (state) => state.posts.comments;
export default postsReducer;