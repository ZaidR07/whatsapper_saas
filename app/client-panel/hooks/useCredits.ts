import { useQuery } from "@tanstack/react-query";

import { creditApi } from "../services/creditApi";

export const useTransactions = () => {
  return useQuery({
    queryKey: ["client-transactions"],
    queryFn: async () => creditApi.transactions(),
    refetchInterval: 15000,
  });
};

export const useCreditUsage = () => {
  return useQuery({
    queryKey: ["client-credit-usage"],
    queryFn: async () => creditApi.usage(),
    refetchInterval: 15000,
  });
};
