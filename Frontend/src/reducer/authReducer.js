// authReducer.js
import { createReducer } from "@reduxjs/toolkit";
import { login, register, logout } from "../actions/authActions";


const initialState = {
  currentUser: null,
  isLoggedIn: false,
  profilePic: null,
};

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(login, (state, action) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
      state.profilePic = action.payload.profilePic;
    })
    .addCase(register, (state, action) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
      state.profilePic = action.payload.profilePic;
    })
    .addCase(logout, (state) => {
      localStorage.removeItem("persist:root");
      localStorage.removeItem("user");
      state.currentUser = null;
      state.isLoggedIn = false;
      state.profilePic = null;
    });
});

export default authReducer;

export const selectUser = (state) => state.auth.currentUser;
export const selectProfilePic = (state) => state.auth.profilePic;