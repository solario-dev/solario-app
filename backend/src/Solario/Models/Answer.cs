public class Answer
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = null!;
    public Question Question { get; set; } = null!;
}