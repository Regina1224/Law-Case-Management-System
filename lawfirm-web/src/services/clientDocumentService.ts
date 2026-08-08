import apiClient from "./apiClients";

export interface ClientDocument {
  documentId: number;
  originalFileName: string;
  documentCategory: string;
  description: string | null;
  fileSizeBytes: number;
  contentType: string;
  uploadedAt: string;
}

export const getClientDocuments = async (
  clientId: number
): Promise<ClientDocument[]> => {
  const response = await apiClient.get(`/clients/${clientId}/documents`);
  return response.data.data;
};

export const getDocumentDownloadUrl = (documentId: number): string => {
  return `${apiClient.defaults.baseURL}/documents/${documentId}/download`;
};

export const uploadClientDocument = async (
  clientId: number,
  file: File,
  documentCategory: string,
  description: string
): Promise<ClientDocument> => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("DocumentCategory", documentCategory);
  formData.append("Description", description);

  const response = await apiClient.post(
    `/clients/${clientId}/documents`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.data;
};