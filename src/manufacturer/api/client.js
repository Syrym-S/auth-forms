import axios from "axios";

export const manufacturerApi = axios.create({
  baseURL: "https://manufacturer.360logistics.kz/wp-json/",
});

manufacturerApi.interceptors.request.use((config) => {
  const nonce = window?.APP_DATA?.nonce || window?.app_data?.nonce;
  if (nonce && !config.headers.has("X-WP-Nonce")) {
    config.headers.set("X-WP-Nonce", nonce);
  }
  return config;
});
