import apiClient from "./apiClients";

export const downloadDocument = async (
  documentId: number,
  fileName: string
): Promise<void> => {
  const response = await apiClient.get(`/documents/${documentId}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};