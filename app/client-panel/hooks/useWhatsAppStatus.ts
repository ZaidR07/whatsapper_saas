import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export const useWhatsAppStatus = () => {

 return useQuery({

  queryKey:["whatsapp-status"],

  queryFn: async ()=>{

   const res = await api.get("/whatsapp/status");

   return res.data;

  },

  refetchInterval: 300000

 });

};