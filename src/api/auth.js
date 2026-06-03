// src/api/auth.js
import { api } from './client';

export const loginRequest = (data) =>
  api.post('/auth/v1/auth', data);

export const registerRequest = (data) =>
  api.post('/auth/v1/register', data);