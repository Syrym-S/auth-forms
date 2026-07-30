// src/api/auth.js
import { api } from "./client";

export const loginRequest = (data) => api.post("/auth/v1/auth", data);
export const loginRequestDriver = (data) => api.post("/auth/v2/auth", data);

export const registerRequest = (data) => api.post("/auth/v1/register", data);
export const registerRequestDriver = (data) => api.post("/auth/v2/register", data);

export const forgotPasswordRequest = (data) =>
  api.post("/auth/v1/forgot-password", data);

export const resetPasswordRequest = (data) =>
  api.post("/auth/v1/reset-password", data);

export const getClaimInfoApi = (claimCode) =>
  api.get("/auth/v1/claim-info", {
    params: {
      claim: claimCode,
    },
  });
