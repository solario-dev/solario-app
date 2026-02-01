import api from "./client";

export interface AnswerDto {
  id: string;
  text: string;
}

export interface QuestionDto {
  id: string;
  text: string;
  answers: AnswerDto[];
}

export interface AnswerRequest {
  answerId: string;
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

export const getQuestionsByPlanet = async (planet: string, count: number = 5): Promise<QuestionDto[]> => {
  const response = await api.get<QuestionDto[]>(`/api/questions?planet=${planet}&count=${count}`);
  return response.data;
};

export const submitAnswer = async (questionId: string, playerId: number, remainingRatio: number, answerId: string): Promise<{ isCorrect: boolean }> => {
  const response = await api.post<{ isCorrect: boolean }>(
    `/api/questions/${questionId}/answer?playerId=${playerId}&remainingRatio=${remainingRatio}`,
    { answerId }
  );
  return response.data;
};

export const createQuestion = async (data: CreateQuestionRequest) => {
    const response = await api.post("/api/questions", data);
    return response.data;
};