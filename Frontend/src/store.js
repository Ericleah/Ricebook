import {
  configureStore,
  getDefaultMiddleware,
  combineReducers,
} from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postsReducer from "./reducer/postsReducer";
import followedUsersReducer from "./reducer/followedUsersReducer";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // You can add 'posts/comments' here too if you want to persist posts data
};

export const rootReducer = combineReducers({
  auth: authReducer,
  posts: postsReducer,
  followedUsers: followedUsersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ["persist/PERSIST"], // Add any other action types you'd like to ignore
    },
  }),
});

export const persistor = persistStore(store);

export default store;