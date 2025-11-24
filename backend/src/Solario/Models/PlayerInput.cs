namespace Solario.Models
{
    public class PlayerInput
    {
        public string PlayerId { get; set; } = "";
        public string Type { get; set; } = "input";
        public InputKeys Keys { get; set; } = new InputKeys();
    }

    public class InputKeys
    {
        public bool Forward { get; set; }
        public bool Backward { get; set; }
        public bool Left { get; set; }
        public bool Right { get; set; }
    }
}