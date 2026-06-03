import axios from 'axios';

const baseURL = window?.APP_DATA?.rest_url || 'https://driver.360logistics.kz/wp-json/';

console.log(baseURL);

const nonce = window?.APP_DATA?.nonce || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    ...(nonce && { 'X-WP-Nonce': nonce }),
  },
});