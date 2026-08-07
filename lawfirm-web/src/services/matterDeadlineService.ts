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