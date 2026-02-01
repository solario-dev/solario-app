namespace Solario.Dto
{
    public class UserStatsDeltaDto
    {
        public int QuestionsAnsweredDelta { get; set; } = 0;
        public int CorrectAnswersDelta { get; set; } = 0;
        public int TotalScoreDelta { get; set; } = 0;

        public float DistanceTraveledDelta { get; set; } = 0f;

        public List<string> NewVisitedPlanets { get; set; } = new();
    }
}
