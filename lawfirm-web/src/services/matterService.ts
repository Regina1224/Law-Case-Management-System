import apiClient from "./apiClients";

export interface MatterListItem {
  matterId: number;
  matterNumber: string;
  matterTitle: string;
  clientName: string;
  matterTypeName: string;
  practiceAreaName: string;
  responsibleLawyer: string | null;
  status: string;
  priority: string | null;
  openedDate: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetMattersParams {
  keyword?: string;
  status?: string;
  practiceAreaId?: number;
  responsibleLawyer?: string;
  matterTypeId?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateMatterDto {
  clientId: number;
  matterTitle: string;
  matterTypeId: number;
  practiceAreaId: number;
  responsibleLawyer: string;
  supportingStaff?: string;
  status: string;
  priority?: string;
  summary: string;
  openedDate: string;
  targetCloseDate?: string;
  isConfidential: boolean;
}

export const getMatters = async (
  params: GetMattersParams
): Promise<PagedResult<MatterListItem>> => {
  const response = await apiClient.get("/matters", { params });
  return response.data.data;
};

export const createMatter = async (
  dto: CreateMatterDto
): Promise<MatterListItem> => {
  const response = await apiClient.post("/matters", dto);
  return response.data.data;
};

export interface MatterDetail {
  matterId: number;
  matterNumber: string;
  matterTitle: string;
  clientId: number;
  clientCode: string;
  clientName: string;
  matterTypeId: number;
  matterTypeName: string;
  practiceAreaId: number;
  practiceAreaName: string;
  responsibleLawyer: string | null;
  supportingStaff: string | null;
  status: string;
  priority: string | null;
  summary: string;
  openedDate: string;
  targetCloseDate: string | null;
  closedDate: string | null;
  closureReason: string | null;
  closureNotes: string | null;
  isConfidential: boolean;
  createdAt: string;
}

export const getMatterById = async (id: number): Promise<MatterDetail> => {
  const response = await apiClient.get(`/matters/${id}`);
  return response.data.data;
};

export interface UpdateMatterDto {
  responsibleLawyer: string;
  supportingStaff?: string;
  status: string;
  priority?: string;
  targetCloseDate?: string;
}

export const updateMatter = async (
  id: number,
  dto: UpdateMatterDto
): Promise<MatterDetail> => {
  const response = await apiClient.put(`/matters/${id}`, dto);
  return response.data.data;
};

export interface CloseMatterDto {
  closureDate: string;
  closureReason: string;
  closureNotes?: string;
}

export const closeMatter = async (
  id: number,
  dto: CloseMatterDto
): Promise<MatterDetail> => {
  const response = await apiClient.put(`/matters/${id}/close`, dto);
  return response.data.data;
};

export const archiveMatter = async (id: number): Promise<MatterDetail> => {
  const response = await apiClient.put(`/matters/${id}/archive`);
  return response.data.data;
};

export const unarchiveMatter = async (id: number): Promise<MatterDetail> => {
  const response = await apiClient.put(`/matters/${id}/unarchive`);
  return response.data.data;
};