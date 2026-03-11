import { api } from "./api";

export type IpLogDto = {
  id: string;
  ipAddress: string;
  loginTime: string;
  deviceInfo: string;
};

export const ipLogApi = {
  list: async (): Promise<{ success: boolean; logs: IpLogDto[] }> => {
    const res = await api.get("/client/ip-logs");
    return res.data;
  },
};
