import axios from "axios";



export const clientAuthApi = {
 login: async (payload: { username: string; password: string }) => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/login`, payload, {
    withCredentials: true
  });
  return response.data;
 },
};
