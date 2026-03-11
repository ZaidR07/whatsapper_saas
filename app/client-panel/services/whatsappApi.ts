import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

export const whatsappApi = {
  getWhatsAppStatus: async () => {
    const response = await axios.get(`${API_BASE_URL}/whatsapp/status`);
    return response.data;
  },

  startWhatsApp: async (payload: { phoneNumber: string | null }) => {
    return axios.post(`${API_BASE_URL}/whatsapp/start`, payload);
  },

  sendMessage: async (payload: { number: string; message: string }) => {
    return axios.post(`${API_BASE_URL}/whatsapp/send`, payload);
  },

  sendCampaign: async (payload: {
    numbers: string[];
    message: string;
    intervalSeconds: number;
    countryCode: string | null;
  }) => {
    return axios.post(`${API_BASE_URL}/whatsapp/campaign`, payload);
  },
};
