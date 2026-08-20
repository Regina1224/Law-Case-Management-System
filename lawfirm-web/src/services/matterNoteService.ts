import apiClient from "./apiClients";

export interface MatterNote {
  matterNoteId: number;
  matterId: number;
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

export const getMatterNotes = async (
  matterId: number
): Promise<MatterNote[]> => {
  const response = await apiClient.get(`/matters/${matterId}/notes`);
  return response.data.data;
};

export const createMatterNote = async (
  matterId: number,
  data: CreateNoteData
): Promise<MatterNote> => {
  const response = await apiClient.post(`/matters/${matterId}/notes`, data);
  return response.data.data;
};

export const deleteMatterNote = async (
  matterId: number,
  noteId: number
): Promise<MatterNote> => {
  const response = await apiClient.delete(`/matters/${matterId}/notes/${noteId}`);
  return response.data.data;
};