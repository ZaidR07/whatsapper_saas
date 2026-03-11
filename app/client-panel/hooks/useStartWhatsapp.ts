import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export const useStartWhatsApp = () => {

 return useMutation({

  mutationFn: async(phoneNumber:string|null)=>{

   const res = await api.post("/whatsapp/start",{
    phoneNumber
   });

   return res.data;

  }

 });

};