import api from "../../../shared/lib/client";
import type { QuestionDto } from "../types/quiz.types";

export const getQuizQuestions = async (params: any) => {
  const response = await api.get<QuestionDto[]>("/quiz/questions", { params });
  return response.data;
}

export const submitAnswer = async (questionId: string, playerId: string, remainingRatio: number, answerId: string): Promise<{ correct: boolean }> => {
  const response = await api.post<{ correct: boolean }>(
    `/api/quiz/questions/${questionId}/answer?playerId=${playerId}`,
    { answerId, remainingRatio }
  );
  return response.data;
};

export const timeoutQuestion = async (questionId: string, playerId: string): Promise<{ correct: boolean }> => {
  const response = await api.post<{ correct: boolean }>(`/api/quiz/questions/${questionId}/timeout?playerId=${playerId}`);
  return response.data;
}

