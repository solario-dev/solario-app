namespace Solario.Dto;

public class QuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public Guid CorrectAnswerId { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}