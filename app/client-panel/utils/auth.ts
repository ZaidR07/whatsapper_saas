export type ClientInfo = {
 id: string;
 companyName: string;
 username: string;
 credits: number;
};

const TOKEN_KEY = "saas_token";
const CLIENT_KEY = "saas_client";

export const auth = {
 getToken: () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
 },

 setToken: (token: string) => {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth_changed"));
 },

 clearToken: () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth_changed"));
 },

 getClient: (): ClientInfo | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CLIENT_KEY);
  if (!raw) return null;
  try {
   return JSON.parse(raw);
  } catch {
   return null;
  }
 },

 setClient: (client: ClientInfo) => {
  window.localStorage.setItem(CLIENT_KEY, JSON.stringify(client));
  window.dispatchEvent(new Event("auth_changed"));
 },

 clearClient: () => {
  window.localStorage.removeItem(CLIENT_KEY);
  window.dispatchEvent(new Event("auth_changed"));
 },

 logout: () => {
  auth.clearToken();
  auth.clearClient();
 },
};
