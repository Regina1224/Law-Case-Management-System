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

export interface CreateIntakeDto {
  prospectiveClientName: string;
  intendedClientType?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  practiceAreaId: number;
  legalIssueSummary: string;
  urgency?: string;
  assignedReviewer?: string;
  sourceOfEnquiry?: string;
  consultationDate?: string;
}

export interface IntakeDetail {
  intakeId: number;
  intakeCode: string;
  prospectiveClientName: string;
  intendedClientType: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  practiceAreaId: number;
  practiceAreaName: string;
  legalIssueSummary: string;
  urgency: string | null;
  assignedReviewer: string | null;
  sourceOfEnquiry: string | null;
  consultationDate: string | null;
  status: string;
  createdAt: string;
}

export const getIntakes = async (
  params: GetIntakesParams
): Promise<PagedResult<IntakeListItem>> => {
  const response = await apiClient.get("/intakes", { params });
  return response.data.data;
};

// Create Intake
export const createIntake = async (
  dto: CreateIntakeDto
): Promise<IntakeDetail> => {
  const response = await apiClient.post("/intakes", dto);
  return response.data.data;
};