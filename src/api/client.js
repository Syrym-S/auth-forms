import axios from "axios";

export const isStaging = window?.APP_DATA?.mode === "staging";

const baseURL = window?.APP_DATA?.rest_url;
const nonce = window?.APP_DATA?.nonce;

console.log(baseURL);

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    ...(nonce && { "X-WP-Nonce": nonce }),
  },
});
