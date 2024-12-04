// authActions.js
import { createAction } from '@reduxjs/toolkit';

export const login = createAction('auth/login');
export const register = createAction('auth/register');
export const logout = createAction('auth/logout');