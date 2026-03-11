import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { campaignApi } from "../services/campaignApi";

export const useCampaigns = () => {
  return useQuery({
    queryKey: ["client-campaigns"],
    queryFn: async () => campaignApi.list(),
    refetchInterval: 10000,
  });
};

export const useCreateCampaign = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: campaignApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client-campaigns"] });
      await qc.invalidateQueries({ queryKey: ["client-dashboard"] });
      await qc.invalidateQueries({ queryKey: ["client-profile"] });
    },
  });
};
