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