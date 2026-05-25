import api from "../../../shared/lib/client";
import type { QuestionDto, CreateQuestionRequest } from "../types/questions.types";

export const getQuestionsByPlanet = async (planet: string, count: number = 5, playerId: string = "0"): Promise<QuestionDto[]> => {
    const response = await api.get<QuestionDto[]>(`/api/questions?planet=${planet}&count=${count}`);
    return response.data;
};

export const createQuestion = async (data: CreateQuestionRequest) => {
    const response = await api.post("/api/questions", data);
    return response.data;
};

export const updateQuestion = async (id: string, data: CreateQuestionRequest) => {
    const response = await api.put(`/api/questions/${id}`, data);
    return response.data;
};

export const deleteQuestion = async (id: string) => {
    await api.delete(`/api/questions/${id}`);
};