import axios from "axios";

export const isStaging = window?.APP_DATA?.mode === "staging";

const baseURL =
  window?.APP_DATA?.rest_url || "https://forwarder.360logistics.kz/wp-json/";

console.log(baseURL);

const nonce = window?.APP_DATA?.nonce || "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    ...(nonce && { "X-WP-Nonce": nonce }),
  },
});
