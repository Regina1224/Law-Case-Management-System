import apiClient from "./apiClients";

export interface MatterTypeDto {
  id: number;
  name: string;
  code?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateMatterTypeDto {
  name: string;
  code?: string;
  displayOrder: number;
}

const matterTypeService = {
  getAll: () => apiClient.get<{ data: MatterTypeDto[] }>("/matterTypes"),
  getById: (id: number) =>
    apiClient.get<{ data: MatterTypeDto }>(`/matterTypes/${id}`),
  create: (dto: CreateMatterTypeDto) =>
    apiClient.post<{ data: MatterTypeDto }>("/matterTypes", dto),
  update: (id: number, dto: CreateMatterTypeDto) =>
    apiClient.put<{ data: MatterTypeDto }>(`/matterTypes/${id}`, dto),
  delete: (id: number) => apiClient.delete(`/matterTypes/${id}`),
};

export default matterTypeService;