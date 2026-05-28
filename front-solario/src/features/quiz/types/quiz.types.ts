export interface AnswerRequest {
    answerId: string;
    remainingRatio: number;
}

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