import api from "./client";

export interface AnswerDto {
  id: string;
  text: string;
}

export interface QuestionDto {
  id: string;
  text: string;
  correctAnswerId: string;
  answers: AnswerDto[];
}

export interface AnswerRequest {
  answerId: string;
  remainingRatio: number;
}

export interface CreateAnswerDto {
    text: string;
}

export interface CreateQuestionRequest {
    planetName: string;
    text: string;
    answers: CreateAnswerDto[];
    correctAnswerIndex: number;
}

export const getQuestionsByPlanet = async (planet: string, count: number = 5, playerId: string = "0"): Promise<QuestionDto[]> => {
  const response = await api.get<QuestionDto[]>(`/api/questions?planet=${planet}&count=${count}`);
  return response.data;
};

export const submitAnswer = async (questionId: string, playerId: string, remainingRatio: number, answerId: string): Promise<{ correct: boolean }> => {
  const response = await api.post<{ correct: boolean }>(
    `/api/quiz/questions/${questionId}/answer?playerId=${playerId}`,
    { answerId, remainingRatio }
  );
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