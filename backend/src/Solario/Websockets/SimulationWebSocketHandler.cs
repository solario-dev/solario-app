using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Solario.Services;
using Solario.Models;

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
            var buffer = new byte[4 * 1024];

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    WebSocketReceiveResult result;
                    try
                    {
                        result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    }
                    catch (WebSocketException ex)
                    {
                        Console.WriteLine($"WebSocketException: {ex.Message}");
                        break; // klient zamknął połączenie nagle
                    }

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                        break;
                    }

                    var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    int selfPlayerId = 0; // domyślnie gracz 0
                    bool jsonError = false;

                    try
                    {
                        var input = JsonSerializer.Deserialize<PlayerInput>(msg);
                        if (input != null && input.Type == "input" && int.TryParse(input.PlayerId, out var pid))
                        {
                            selfPlayerId = pid;
                            _simulationService.ApplyPlayerInput(pid, input);
                        }
                        else
                        {
                            jsonError = true;
                        }
                    }
                    catch
                    {
                        jsonError = true;
                    }

                    string json;
                    if (jsonError)
                    {
                        // Wyślij informację o błędzie JSON
                        json = JsonSerializer.Serialize(new
                        {
                            type = "error",
                            message = "Niepoprawny JSON lub brak wymaganych pol"
                        }, new JsonSerializerOptions { WriteIndented = true });
                    }
                    else
                    {
                        // Wyślij pełny stan symulacji
                        json = _simulationService.GetFullStateJson(selfPlayerId);
                    }

                    await webSocket.SendAsync(
                        Encoding.UTF8.GetBytes(json),
                        WebSocketMessageType.Text,
                        true,
                        CancellationToken.None
                    );
                }
            }
            finally
            {
                if (webSocket.State != WebSocketState.Closed)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                }
            }
        }
    }
}
