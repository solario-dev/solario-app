public class QuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public List<AnswerDto> Answers { get; set; } = new();
}
