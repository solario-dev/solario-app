namespace Solario.Dto
{
    public class UserStatsDeltaDto
    {
        public int TotalScoreDelta { get; set; }
        public int QuestionsAnsweredDelta { get; set; }
        public int CorrectAnswersDelta { get; set; }
        public int DistanceTraveledDelta { get; set; }

        public List<string> NewVisitedPlanets { get; set; } = new();
        public int QuizzesCompletedDelta { get; set; }
    }
}
