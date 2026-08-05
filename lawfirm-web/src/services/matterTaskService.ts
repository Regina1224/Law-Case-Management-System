import apiClient from "./apiClients";

export interface MatterTaskListItem {
  matterTaskId: number;
  matterId: number;
  title: string;
  assignedTo: string | null;
  priority: string;
  status: string;
  dueDate: string;
  createdBy: string | null;
  createdAt: string;
}

export interface GetMatterTasksParams {
  status?: string;
  assignedTo?: string;
  priority?: string;
}

export const getMatterTasks = async (
  matterId: number,
  params: GetMatterTasksParams = {}
): Promise<MatterTaskListItem[]> => {
  const response = await apiClient.get(`/matters/${matterId}/tasks`, {
    params,
  });
  return response.data.data;
};