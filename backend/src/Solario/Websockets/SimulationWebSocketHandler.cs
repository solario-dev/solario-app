namespace Solario.Websockets;

using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Solario.Services;
using Solario.Models;
using Microsoft.Extensions.Logging;

public class SimulationWebSocketHandler
{
    private readonly SimulationService _simulation;
    private readonly ILogger<SimulationWebSocketHandler> _logger;
    private readonly JsonSerializerOptions _jsonOptions =
        new() { PropertyNameCaseInsensitive = true };

    public SimulationWebSocketHandler(
        SimulationService simulation,
        ILogger<SimulationWebSocketHandler> logger)
    {
        _simulation = simulation;
        _logger = logger;
    }

    public async Task HandleAsync(WebSocket socket)
    {
        var buffer = new byte[4096];
        string playerId = "0";
        var cts = new CancellationTokenSource();

        try
        {
            var receive = Task.Run(async () =>
            {
                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(
                        new ArraySegment<byte>(buffer), cts.Token);

                    if (result.MessageType == WebSocketMessageType.Close)
                        break;

                    var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    using var doc = JsonDocument.Parse(msg);

                    if (!doc.RootElement.TryGetProperty("type", out var t))
                        continue;

                    switch (t.GetString())
                    {
                        case "input":
                        {
                            var input = JsonSerializer.Deserialize<PlayerInput>(msg, _jsonOptions);
                            if (input?.PlayerId == null) break;

                            if (playerId != input.PlayerId)
                            {
                                playerId = input.PlayerId;
                                _simulation.InitPlayer(playerId, 0, 0, 0, 0, 1, "default");
                            }

                            _simulation.ApplyPlayerInput(playerId, input);
                            break;
                        }

                        case "enter_quiz":
                        {
                            var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg, _jsonOptions);
                            if (cmd?.PlayerId != null && cmd.Planet != null)
                            {
                                playerId = cmd.PlayerId;
                                _simulation.EnterQuiz(playerId, cmd.Planet);
                            }
                            break;
                        }

                        case "leave_quiz":
                        {
                            var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg, _jsonOptions);
                            if (cmd?.PlayerId != null)
                            {
                                playerId = cmd.PlayerId;
                                _simulation.LeaveQuiz(playerId);
                            }
                            break;
                        }
                    }
                }
            });

            var send = Task.Run(async () =>
            {
                while (socket.State == WebSocketState.Open)
                {
                    var json = _simulation.GetFullStateJson(playerId);
                    var bytes = Encoding.UTF8.GetBytes(json);

                    await socket.SendAsync(
                        new ArraySegment<byte>(bytes),
                        WebSocketMessageType.Text,
                        true,
                        cts.Token);

                    await Task.Delay(33, cts.Token);
                }
            });

            await Task.WhenAny(receive, send);
        }
        finally
        {
            if (playerId != "0")
                await _simulation.RemovePlayerAsync(playerId);

            cts.Cancel();
            if (socket.State != WebSocketState.Closed)
                await socket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "closing",
                    CancellationToken.None);
        }
    }
}
