import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

export const clientAuthApi = {
 login: async (payload: { username: string; password: string }) => {
  const response = await axios.post(`${API_BASE_URL}/client/login`, payload);
  return response.data;
 },
};
