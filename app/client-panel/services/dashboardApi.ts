import { api } from "./api";

export type RecentCampaignDto = {
  id: string;
  campaignName: string;
  deviceId: string;
  numbers: number;
  sent: number;
  failed: number;
  status: string;
  createdAt: string;
};

export type DashboardOverviewDto = {
  success: boolean;
  stats: {
    creditsRemaining: number;
    connectedDevices: number;
    messagesSentToday: number;
    totalCampaigns: number;
  };
  recentCampaigns: RecentCampaignDto[];
};

export const dashboardApi = {
  overview: async (): Promise<DashboardOverviewDto> => {
    const res = await api.get("/client/dashboard");
    return res.data;
  },
};
