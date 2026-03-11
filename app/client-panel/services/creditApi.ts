import { api } from "./api";

export type TransactionDto = {
  id: string;
  date: string;
  type: string;
  credits: number;
  description: string;
};

export type CreditUsageDto = {
  id: string;
  campaignId: string | null;
  number: string | null;
  creditsUsed: number;
  date: string;
  description: string;
};

export const creditApi = {
  transactions: async (): Promise<{ success: boolean; transactions: TransactionDto[] }> => {
    const res = await api.get("/client/transactions");
    return res.data;
  },

  usage: async (): Promise<{ success: boolean; usage: CreditUsageDto[] }> => {
    const res = await api.get("/client/credit-usage");
    return res.data;
  },
};
