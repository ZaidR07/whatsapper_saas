import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deviceApi } from "../services/deviceApi";

export const useDevices = () => {
 return useQuery({
  queryKey: ["devices"],
  queryFn: async () => deviceApi.list(),
  refetchInterval: 15000,
 });
};

export const useConnectDevice = () => {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: deviceApi.connect,
  onSuccess: async () => {
   await qc.invalidateQueries({ queryKey: ["devices"] });
  },
 });
};

export const useDisconnectDevice = () => {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (deviceId: string) => deviceApi.disconnect(deviceId),
  onSuccess: async () => {
   await qc.invalidateQueries({ queryKey: ["devices"] });
  },
 });
};

export const useDeleteDevice = () => {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (deviceId: string) => deviceApi.remove(deviceId),
  onSuccess: async () => {
   await qc.invalidateQueries({ queryKey: ["devices"] });
  },
 });
};

export const useDeviceStatus = (deviceId: string | null) => {
 return useQuery({
  queryKey: ["device-status", deviceId],
  enabled: !!deviceId,
  queryFn: async () => deviceApi.status(String(deviceId)),
  refetchInterval: 4000,
 });
};

export const useDeviceQr = (deviceId: string | null) => {
 return useQuery({
  queryKey: ["device-qr", deviceId],
  enabled: !!deviceId,
  queryFn: async () => deviceApi.qr(String(deviceId)),
  refetchInterval: 4000,
 });
};

export const useRefreshDevice = () => {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (deviceId: string) => deviceApi.refresh(deviceId),
  onSuccess: async () => {
   await qc.invalidateQueries({ queryKey: ["devices"] });
  },
 });
};

export const useSetDeviceUserStatus = () => {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (payload: { deviceId: string; userStatus: "online" | "offline" | "" }) =>
   deviceApi.setUserStatus(payload.deviceId, payload.userStatus),
  onSuccess: async () => {
   await qc.invalidateQueries({ queryKey: ["devices"] });
  },
 });
};

export const useLogoutDeleteDevice = () => {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (deviceId: string) => deviceApi.logoutDelete(deviceId),
  onSuccess: async () => {
   await qc.invalidateQueries({ queryKey: ["devices"] });
  },
 });
};
