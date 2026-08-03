import apiClient from "./apiClients";

export interface IntakeListItem {
  intakeId: number;
  intakeCode: string;
  prospectiveClientName: string;
  practiceAreaName: string;
  assignedReviewer: string | null;
  status: string;
  urgency: string | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetIntakesParams {
  keyword?: string;
  status?: string;
  practiceAreaId?: number;
  assignedReviewer?: string;
  page?: number;
  pageSize?: number;
}

export const getIntakes = async (
  params: GetIntakesParams
): Promise<PagedResult<IntakeListItem>> => {
  const response = await apiClient.get("/intakes", {params});
  return response.data.data;

};