import apiClient from "./apiClients";

export interface ClientContact {
  clientContactId: number;
  clientId: number;
  contactName: string;
  relationshipType: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateContactData {
  contactName: string;
  relationshipType: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export const getClientContacts = async (
  clientId: number
): Promise<ClientContact[]> => {
  const response = await apiClient.get(`/clients/${clientId}/contacts`);
  return response.data.data;
};

export const createClientContact = async (
  clientId: number,
  data: CreateContactData
): Promise<ClientContact> => {
  const response = await apiClient.post(`/clients/${clientId}/contacts`, data);
  return response.data.data;
};

export const deactivateClientContact = async (
  clientId: number,
  contactId: number
): Promise<ClientContact> => {
  const response = await apiClient.put(
    `/clients/${clientId}/contacts/${contactId}/deactivate`
  );
  return response.data.data;
};