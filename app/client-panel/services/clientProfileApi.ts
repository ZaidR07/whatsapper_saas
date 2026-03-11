import axios from "axios";
import { auth } from "../utils/auth";

const API_BASE_URL = "http://localhost:4000/api";

const authHeader = () => {
 const token = auth.getToken();
 return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clientProfileApi = {
 me: async () => {
  const response = await axios.get(`${API_BASE_URL}/client/me`, { headers: authHeader() });
  return response.data;
 },

 updateProfile: async (payload: {
  name: string;
  companyName: string;
  email: string;
  mobile: string;
  password: string;
 }) => {
  const response = await axios.put(`${API_BASE_URL}/client/update-profile`, payload, { headers: authHeader() });
  return response.data;
 },
};
