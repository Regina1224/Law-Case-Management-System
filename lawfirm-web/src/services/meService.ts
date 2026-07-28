import apiClient from "./apiClients";

export interface CurrentUser{
    displayName: string;
    email: string;
    role: string;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
    const response = await apiClient.get("/me");
    return response.data.data;
};