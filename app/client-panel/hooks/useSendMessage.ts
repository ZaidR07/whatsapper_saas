import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export const useSendMessage = () => {

 return useMutation({

  mutationFn: async(data:any)=>{

   const res = await api.post("/whatsapp/send",data);

   return res.data;

  }

 });

};