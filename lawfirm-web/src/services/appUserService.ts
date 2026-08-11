import apiClient from "./apiClients";

export interface AppUser {
  appUserId: number;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export const getAppUsers = async (): Promise<AppUser[]> => {
  const response = await apiClient.get("/appusers");
  return response.data.data;
};