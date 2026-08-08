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

export const uploadMatterDocument = async (
  matterId: number,
  file: File,
  documentCategory: string,
  description: string
): Promise<MatterDocument> => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("DocumentCategory", documentCategory);
  formData.append("Description", description);

  const response = await apiClient.post(
    `/matters/${matterId}/documents`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.data;
};