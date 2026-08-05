import apiClient from "./apiClients";

export interface MatterRelatedParty {
  matterRelatedPartyId: number;
  matterId: number;
  partyName: string;
  partyType: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

export interface RelatedPartyData {
  partyName: string;
  partyType: string;
  email?: string;
  phone?: string;
  organization?: string;
  address?: string;
  notes?: string;
}

export const getMatterRelatedParties = async (
  matterId: number
): Promise<MatterRelatedParty[]> => {
  const response = await apiClient.get(`/matters/${matterId}/related-parties`);
  return response.data.data;
};

export const createMatterRelatedParty = async (
  matterId: number,
  data: RelatedPartyData
): Promise<MatterRelatedParty> => {
  const response = await apiClient.post(
    `/matters/${matterId}/related-parties`,
    data
  );
  return response.data.data;
};

export const updateMatterRelatedParty = async (
  matterId: number,
  partyId: number,
  data: RelatedPartyData
): Promise<MatterRelatedParty> => {
  const response = await apiClient.put(
    `/matters/${matterId}/related-parties/${partyId}`,
    data
  );
  return response.data.data;
};

export const deactivateMatterRelatedParty = async (
  matterId: number,
  partyId: number
): Promise<MatterRelatedParty> => {
  const response = await apiClient.put(
    `/matters/${matterId}/related-parties/${partyId}/deactivate`
  );
  return response.data.data;
};