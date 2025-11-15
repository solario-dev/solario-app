using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Solario.Services;

namespace Solario.Websockets
{
    public class SimulationWebSocketHandler
    {
        private readonly SimulationService _simulationService;

        public SimulationWebSocketHandler(SimulationService simulationService)
        {
            _simulationService = simulationService;
        }

        public async Task HandleAsync(WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];

            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                // Zamknięcie po stronie klienta
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    break;
                }

                // Każda wiadomość od klienta → wyślij aktualny stan planet
                var planets = _simulationService.GetPlanetsSnapshot();
                var json = JsonSerializer.Serialize(planets);

                await webSocket.SendAsync(
                    Encoding.UTF8.GetBytes(json),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
        }
    }
}