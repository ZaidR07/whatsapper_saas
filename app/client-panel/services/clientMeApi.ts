import { api } from "./api";

export type ClientMe = {
  id: string;
  companyName: string;
  username: string;
  credits: number;
};

export const clientMeApi = {
  me: async () => {
    const res = await api.get("/client/me");
    return res.data as { success: boolean; client: ClientMe };
  },
};
