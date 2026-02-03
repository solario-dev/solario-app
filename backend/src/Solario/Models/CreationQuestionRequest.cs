namespace Solario.Models
{
    public class CreateQuestionRequest
    {
        public string PlanetName { get; set; } = null!;
        public string Text { get; set; } = null!;
        public List<CreateAnswerRequest> Answers { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
    }

    public class UpdateQuestionRequest : CreateQuestionRequest
    {
    }
}