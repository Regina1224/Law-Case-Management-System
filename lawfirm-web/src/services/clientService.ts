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

export interface CreateClientData {
  clientType: string;
  status: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  dateOfBirth?: string;
  organizationName?: string;
  tradingName?: string;
  abnAcn?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  internalNotesSummary?: string;
}

export const getClients = async (
  params: GetClientsParams,
): Promise<PagedResult<ClientListItem>> => {
  const response = await apiClient.get("/clients", { params });
  return response.data.data;
};

export const createClient = async (
  data: CreateClientData,
): Promise<ClientListItem> => {
  const response = await apiClient.post("/clients", data);
  return response.data.data;
};
