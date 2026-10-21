import { manufacturerApi } from "./client";

export const loginRequest = (data, nonce) =>
  manufacturerApi.post("/auth/v1/auth", data, {
    headers: { "X-WP-Nonce": nonce },
  });

export const registerRequest = (data, nonce) =>
  manufacturerApi.post("/auth/v1/register", data, {
    headers: { "X-WP-Nonce": nonce },
  });

export const searchCustomersRequest = (query, signal) =>
  manufacturerApi.get("/auth/v1/customers", {
    params: { q: query },
    headers: {
      "X-WP-Nonce": window?.APP_DATA?.nonce || window?.app_data?.nonce,
    },
    signal,
  });

export const getClaimInfoApi = (claimCode) =>
  manufacturerApi.get("/auth/v1/claim-info", {
    params: { claim: claimCode },
  });
