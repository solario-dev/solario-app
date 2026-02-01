public class Question
{
    public Guid Id { get; set; }
    public string PlanetName { get; set; } = null!;
    public string Text { get; set; } = null!;
    public Guid CorrectAnswerId { get; set; }

    public List<Answer> Answers { get; set; } = new();
}
