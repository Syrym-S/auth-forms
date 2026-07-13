import { Capacitor } from '@capacitor/core';


// src/api/auth.js
import { api } from './client';

export const loginRequest = (data) =>
  api.post(!Capacitor.isNativePlatform() ? '/auth/v1/auth' : '/auth/v2/auth', data);

export const registerRequest = (data) =>
  api.post(!Capacitor.isNativePlatform() ? '/auth/v1/register' : '/auth/v2/register', data);