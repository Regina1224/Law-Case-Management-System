import apiClient from "./apiClients";

export interface MatterTaskListItem {
  matterTaskId: number;
  matterId: number;
  title: string;
  description: string | null;
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

export interface CreateMatterTaskDto {
  title: string;
  description?: string;
  assignedTo: string;
  priority: string;
  dueDate: string;
}

export const createMatterTask = async (
  matterId: number,
  dto: CreateMatterTaskDto
): Promise<MatterTaskListItem> => {
  const response = await apiClient.post(`/matters/${matterId}/tasks`, dto);
  return response.data.data;
};

export interface UpdateMatterTaskDto {
  title: string;
  description?: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
}

export const updateMatterTask = async (
  matterId: number,
  taskId: number,
  dto: UpdateMatterTaskDto
): Promise<MatterTaskListItem> => {
  const response = await apiClient.put(`/matters/${matterId}/tasks/${taskId}`, dto);
  return response.data.data;
};