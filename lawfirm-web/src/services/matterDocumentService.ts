import apiClient from "./apiClients";

export interface MatterDocument {
  documentId: number;
  originalFileName: string;
  documentCategory: string;
  description: string | null;
  fileSizeBytes: number;
  contentType: string;
  uploadedAt: string;
}

export const getMatterDocuments = async (
  matterId: number
): Promise<MatterDocument[]> => {
  const response = await apiClient.get(`/matters/${matterId}/documents`);
  return response.data.data;
};

export const getDocumentDownloadUrl = (documentId: number): string => {
  return `${apiClient.defaults.baseURL}/documents/${documentId}/download`;
};