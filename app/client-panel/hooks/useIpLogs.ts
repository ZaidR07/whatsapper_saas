import { useQuery } from "@tanstack/react-query";

import { ipLogApi } from "../services/ipLogApi";

export const useIpLogs = () => {
  return useQuery({
    queryKey: ["client-ip-logs"],
    queryFn: async () => ipLogApi.list(),
    refetchInterval: 30000,
  });
};
