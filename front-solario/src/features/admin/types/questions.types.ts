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

export interface CreateAnswerRequest {
    text: string;
}

export interface CreateQuestionRequest {
    planetName: string;
    text: string;
    answers: CreateAnswerRequest[];
    correctAnswerIndex: number;
}

export interface UpdateQuestionRequest {
    planetName: string;
    text: string;
    answers: AnswerDto[];
    correctAnswerIndex: number;
}
