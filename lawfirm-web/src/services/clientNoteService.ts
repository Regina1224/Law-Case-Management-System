import apiClient from "./apiClients";

export interface ClientNote {
  clientNoteId: number;
  clientId: number;
  noteTitle: string;
  noteContent: string;
  noteType: string | null;
  createdAt: string;
}

export interface CreateNoteData {
  noteTitle: string;
  noteContent: string;
  noteType?: string;
}

export const getClientNotes = async (
  clientId: number
): Promise<ClientNote[]> => {
  const response = await apiClient.get(`/clients/${clientId}/notes`);
  return response.data.data;
};

export const createClientNote = async (
  clientId: number,
  data: CreateNoteData
): Promise<ClientNote> => {
  const response = await apiClient.post(`/clients/${clientId}/notes`, data);
  return response.data.data;
};