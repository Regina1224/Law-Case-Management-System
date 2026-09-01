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
  convertedClientId: number | null;
  convertedMatterId: number | null;
}

// Convert Intake request body type
export interface ConvertIntakeDto {
  // Set to reuse an existing client; omit to create a new one from the fields below.
  existingClientId?: number;

  clientType?: string; // "Individual" or "Corporate"
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;

  matterTitle: string;
  matterTypeId: number;
  responsibleLawyer: string;
  supportingStaff?: string;
  status: string;
  priority?: string;
  openedDate: string;
  targetCloseDate?: string;
  isConfidential: boolean;
}

export interface ConvertIntakeResult {
  intakeId: number;
  intakeCode: string;
  intakeStatus: string;
  clientId: number;
  clientCode: string;
  clientName: string;
  matterId: number;
  matterNumber: string;
  matterTitle: string;
}

// Update Intake request body type
export interface UpdateIntakeDto {
  status: string;
  assignedReviewer?: string;
  practiceAreaId: number;
  urgency?: string;
  consultationDate?: string;
  legalIssueSummary: string;
}

// File Type
export interface IntakeDocument {
  documentId: number;
  originalFileName: string;
  documentCategory: string;
  description: string | null;
  fileSizeBytes: number;
  contentType: string;
  uploadedAt: string;
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

// Get Intake details
export const getIntakeById = async (id: number): Promise<IntakeDetail> => {
  const response = await apiClient.get(`/intakes/${id}`);
  return response.data.data;
};

// Update Intake
export const updateIntake = async (
  id: number,
  dto: UpdateIntakeDto
): Promise<IntakeDetail> => {
  const response = await apiClient.put(`/intakes/${id}`, dto);
  return response.data.data;
};

// Convert Intake into a Client and Matter
export const convertIntake = async (
  id: number,
  dto: ConvertIntakeDto
): Promise<ConvertIntakeResult> => {
  const response = await apiClient.post(`/intakes/${id}/convert`, dto);
  return response.data.data;
};

// Get Intake file list
export const getIntakeDocuments = async (
  intakeId: number
): Promise<IntakeDocument[]> => {
  const response = await apiClient.get(`/intakes/${intakeId}/documents`);
  return response.data.data;
};

// Upload Intake document
export const uploadIntakeDocument = async (
  intakeId: number,
  file: File,
  documentCategory: string,
  description: string
): Promise<IntakeDocument> => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("DocumentCategory", documentCategory);
  formData.append("Description", description);

  const response = await apiClient.post(
    `/intakes/${intakeId}/documents`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.data;
};