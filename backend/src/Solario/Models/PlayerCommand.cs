namespace Solario.Models;

public class PlayerCommand
{
    public string Type { get; set; } = null!;
    public string PlayerId { get; set; } = null!;
    public string? Planet { get; set; }
}
