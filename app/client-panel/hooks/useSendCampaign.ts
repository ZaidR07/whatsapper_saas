import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "../services/campaignApi";
import { clientProfileApi } from "../services/clientProfileApi";
import { auth } from "../utils/auth";

export const useSendCampaign = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      campaignName: string;
      deviceId: string;
      message: string;
      numbers: string[];
      intervalSeconds?: number;
      countryCode?: string | null;
      attachments?: File[];
    }) => campaignApi.create(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client-campaigns"] });
      await qc.invalidateQueries({ queryKey: ["client-dashboard"] });
      await qc.invalidateQueries({ queryKey: ["devices"] });

      try {
        const me = await clientProfileApi.me();
        const client = me?.client || me?.data;
        if (client?.id && client?.username) {
          auth.setClient({
            id: client.id,
            companyName: client.companyName,
            username: client.username,
            credits: Number(client.credits ?? 0),
            mobile: client.mobile,
            email: client.email,
          });
        }
      } catch {
        // ignore profile refresh errors
      }
    },
  });
};