import apiClient from "./apiClients";

export interface PracticeAreaDto{
    id: number;
    name: string;
    code?:string;
    displayOrder: number;
    isActive: boolean;
}

export interface CreatePracticeAreaDto{
    name: string;
    code?:string;
    displayOrder: number;
}

const practiceAreaService = {
    getAll: () => apiClient.get<{ data: PracticeAreaDto[] }>('/practiceareas'),
    getById: (id: number) => apiClient.get<{ data: PracticeAreaDto }>(`/practiceareas/${id}`),
    create: (dto: CreatePracticeAreaDto) => apiClient.post<{ data: PracticeAreaDto }>('/practiceareas', dto),
    update: (id: number, dto: CreatePracticeAreaDto) => apiClient.put<{ data: CreatePracticeAreaDto }>(`/practiceareas/${id}`, dto),
    delete: (id: number) => apiClient.delete(`/practiceareas/${id}`),
};

export default practiceAreaService;