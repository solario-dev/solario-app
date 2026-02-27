using System;

namespace Solario.Dto
{
    public class AnswerRequest
    {
        public Guid AnswerId { get; set; }
        public double RemainingRatio { get; set; }
    }
}