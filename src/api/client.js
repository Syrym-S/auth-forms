import axios from "axios";

export const isStaging = window?.APP_DATA?.mode === "staging";

const baseURL = window?.APP_DATA?.rest_url;

console.log(baseURL);

export const api = axios.create({ baseURL: baseURL });
