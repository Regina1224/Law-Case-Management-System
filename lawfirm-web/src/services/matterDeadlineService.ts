import apiClient from "./apiClients";

export interface MatterDeadlineListItem {
  matterDeadlineId: number;
  matterId: number;
  title: string;
  deadlineType: string;
  dueDateTime: string;
  responsiblePerson: string | null;
  locationOrCourt: string | null;
  notes: string | null;
  status: string;
}

export const getMatterDeadlines = async (
  matterId: number
): Promise<MatterDeadlineListItem[]> => {
  const response = await apiClient.get(`/matters/${matterId}/deadlines`);
  return response.data.data;
};

export interface CreateMatterDeadlineDto {
  title: string;
  deadlineType: string;
  dueDateTime: string;
  responsiblePerson: string;
  locationOrCourt?: string;
  notes?: string;
}

export const createMatterDeadline = async (
  matterId: number,
  dto: CreateMatterDeadlineDto
): Promise<MatterDeadlineListItem> => {
  const response = await apiClient.post(`/matters/${matterId}/deadlines`, dto);
  return response.data.data;
};