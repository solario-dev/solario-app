namespace Solario.Dto;

public class UserStatsDto
{
    public string UserId { get; set; } = null!;

    public int TotalScore { get; set; }
    public int QuestionsAnswered { get; set; }
    public int CorrectAnswers { get; set; }
    public int QuizzesCompleted { get; set; }

    public int DistanceTraveled { get; set; }

    public List<string> ConqueredPlanets { get; set; } = new();
}