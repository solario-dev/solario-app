public class CreateQuestionDto
{
    public string PlanetName { get; set; } = null!;
    public string Text { get; set; } = null!;

    public List<CreateAnswerDto> Answers { get; set; } = new();

    // indeks poprawnej odpowiedzi (np. 0,1,2)
    public int CorrectAnswerIndex { get; set; }
}