import { api } from "./api";

export type CampaignDto = {
  id: string;
  campaignName: string;
  deviceId: string;
  numbers: number;
  sent: number;
  failed: number;
  date: string;
  status: string;
};

export const campaignApi = {
  list: async (): Promise<{ success: boolean; campaigns: CampaignDto[] }> => {
    const res = await api.get("/client/campaigns");
    return res.data;
  },

  create: async (payload: {
    campaignName: string;
    deviceId: string;
    message: string;
    numbers: string[];
  }): Promise<any> => {
    const res = await api.post("/client/campaigns", payload);
    return res.data;
  },
};
