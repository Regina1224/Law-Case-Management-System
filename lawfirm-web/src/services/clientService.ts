import apiClient from "./apiClients";

export interface ClientListItem {
  clientId: number;
  clientCode: string;
  clientName: string;
  clientType: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetClientsParams {
  keyword?: string;
  clientType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const getClients = async (params: GetClientsParams): Promise<PagedResult<ClientListItem>> => {
  const response = await apiClient.get("/clients", {params});
  return response.data.data;
};