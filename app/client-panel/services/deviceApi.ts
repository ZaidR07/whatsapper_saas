import { api } from "./api";

export type DeviceDto = {
 id: string;
 deviceName: string;
 ipAddress: string;
 createdAt: string;
 sessionToken: string;
 status: string;
 phoneNumber?: string;
 userStatus?: string;
};

export const deviceApi = {
 list: async (): Promise<{ success: boolean; devices: DeviceDto[] }> => {
  const res = await api.get("/devices");
  return res.data;
 },

 connect: async (payload: { deviceName?: string; method?: "qr" | "pairing"; phoneNumber?: string }) => {
  const res = await api.post("/device/connect", payload);
  return res.data as { success: boolean; device: DeviceDto };
 },

 status: async (deviceId: string) => {
  const res = await api.get(`/client/device/${deviceId}/status`);
  return res.data as { success: boolean; device: DeviceDto; wsStatus: any };
 },

 qr: async (deviceId: string) => {
  const res = await api.get(`/device/qr/${deviceId}`);
  return res.data as { success: boolean; status: "waiting" | "ready"; qr?: string };
 },

 disconnect: async (deviceId: string) => {
  const res = await api.post(`/device/disconnect/${deviceId}`);
  return res.data;
 },

 refresh: async (deviceId: string) => {
  const res = await api.get(`/client/device/${deviceId}/status`);
  return res.data as { success: boolean; device: DeviceDto; wsStatus: any };
 },

 setUserStatus: async (deviceId: string, userStatus: "online" | "offline" | "") => {
  if (userStatus === "online") {
   const res = await api.patch(`/client/device/${deviceId}/online`);
   return res.data as { success: boolean; userStatus: string };
  }
  if (userStatus === "offline") {
   const res = await api.patch(`/client/device/${deviceId}/offline`);
   return res.data as { success: boolean; userStatus: string };
  }
  const res = await api.post(`/device/user-status/${deviceId}`, { userStatus: "" });
  return res.data as { success: boolean; userStatus: string };
 },

 remove: async (deviceId: string) => {
  const res = await api.delete(`/device/${deviceId}`);
  return res.data;
 },

 logoutDelete: async (deviceId: string) => {
  const res = await api.delete(`/client/device/${deviceId}`);
  return res.data;
 },
};
