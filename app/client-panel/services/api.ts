import axios from "axios";
import { auth } from "../utils/auth";

export const api = axios.create({
  baseURL: "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});