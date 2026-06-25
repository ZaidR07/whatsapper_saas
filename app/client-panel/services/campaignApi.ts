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
    intervalSeconds?: number;
    countryCode?: string | null;
    attachments?: File[];
  }): Promise<any> => {
    if (payload.attachments && payload.attachments.length > 0) {
      const fd = new FormData();
      fd.append("campaignName", payload.campaignName);
      fd.append("deviceId", payload.deviceId);
      fd.append("message", payload.message);
      fd.append("numbers", JSON.stringify(payload.numbers || []));
      if (payload.intervalSeconds != null) fd.append("intervalSeconds", String(payload.intervalSeconds));
      if (payload.countryCode != null) fd.append("countryCode", String(payload.countryCode));
      
      payload.attachments.forEach((file) => {
        fd.append("attachments", file);
      });

      const res = await api.post("/client/campaigns", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    const { attachments, ...rest } = payload;
    const res = await api.post("/client/campaigns", rest);
    return res.data;
  },
};
