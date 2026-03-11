import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../services/dashboardApi";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ["client-dashboard"],
    queryFn: async () => dashboardApi.overview(),
    refetchInterval: 10000,
  });
};
