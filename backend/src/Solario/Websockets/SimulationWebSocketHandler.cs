using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Solario.Services;
using Solario.Models;
using Microsoft.Extensions.Logging;

namespace Solario.Websockets
{
    public class SimulationWebSocketHandler
    {
        private readonly SimulationService _simulationService;
        private readonly ILogger<SimulationWebSocketHandler> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public SimulationWebSocketHandler(SimulationService simulationService, ILogger<SimulationWebSocketHandler> logger)
        {
            _simulationService = simulationService;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task HandleAsync(WebSocket webSocket)
        {
            var buffer = new byte[4 * 1024];
            string selfPlayerId = "0"; 
            var cts = new CancellationTokenSource();

            _logger.LogInformation("WebSocket connection established");

            try
            {
                var receiveTask = Task.Run(async () =>
                {
                    while (webSocket.State == WebSocketState.Open && !cts.Token.IsCancellationRequested)
                    {
                        try
                        {
                            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cts.Token);

                            if (result.MessageType == WebSocketMessageType.Close)
                            {
                                cts.Cancel();
                                break;
                            }

                            var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);

                            JsonDocument doc;
                            try
                            {
                                doc = JsonDocument.Parse(msg);
                            }
                            catch (JsonException)
                            {
                                _logger.LogWarning("Received invalid JSON");
                                continue;
                            }

                            var root = doc.RootElement;

                            if (!root.TryGetProperty("Type", out var typeProp) && 
                                !root.TryGetProperty("type", out typeProp))
                            {
                                continue;
                            }

                            var type = typeProp.GetString();

                            if (type == "input")
                            {
                                var input = JsonSerializer.Deserialize<PlayerInput>(msg, _jsonOptions);

                                if (input != null && !string.IsNullOrEmpty(input.PlayerId))
                                {
                                    var pid = input.PlayerId;

                                    if (selfPlayerId != pid)
                                    {
                                        _simulationService.InitPlayer(pid, 0, 0, 0, 0, 1, "default"); 
                                    }
                                    selfPlayerId = pid;
                                    _simulationService.ApplyPlayerInput(pid, input);
                                }
                            }
                            else if (type == "enter_quiz")
                            {
                                var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg, _jsonOptions);

                                if (cmd != null &&
                                    !string.IsNullOrEmpty(cmd.PlayerId) &&
                                    !string.IsNullOrWhiteSpace(cmd.Planet))
                                {
                                    _logger.LogInformation("Player {PlayerId} entering quiz on {Planet}", cmd.PlayerId, cmd.Planet);
                                    selfPlayerId = cmd.PlayerId;
                                    _simulationService.EnterQuiz(cmd.PlayerId, cmd.Planet);
                                }
                            }
                            else if (type == "leave_quiz")
                            {
                                var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg, _jsonOptions);

                                if (cmd != null && !string.IsNullOrEmpty(cmd.PlayerId))
                                {
                                    _logger.LogInformation("Player {PlayerId} leaving quiz", cmd.PlayerId);
                                    selfPlayerId = cmd.PlayerId;
                                    _simulationService.LeaveQuiz(cmd.PlayerId);
                                }
                            }

                        }
                        catch (OperationCanceledException) { break; }
                        catch (WebSocketException) { cts.Cancel(); break; }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing WebSocket message");
                        }
                    }
                }, cts.Token);

                var sendTask = Task.Run(async () =>
                {
                    while (webSocket.State == WebSocketState.Open && !cts.Token.IsCancellationRequested)
                    {
                        try
                        {
                            var json = _simulationService.GetFullStateJson(selfPlayerId);
                            var bytes = Encoding.UTF8.GetBytes(json);

                            await webSocket.SendAsync(
                                new ArraySegment<byte>(bytes),
                                WebSocketMessageType.Text,
                                true,
                                cts.Token
                            );

                            await Task.Delay(33, cts.Token);
                        }
                        catch (OperationCanceledException) { break; }
                        catch (WebSocketException) { cts.Cancel(); break; }
                    }
                }, cts.Token);

                await Task.WhenAny(receiveTask, sendTask);
                cts.Cancel();
                await Task.WhenAll(receiveTask, sendTask);
            }
            finally
            {
                if (selfPlayerId != "0")
                {
                    await _simulationService.RemovePlayerAsync(selfPlayerId);
                }

                cts.Dispose();
                if (webSocket.State != WebSocketState.Closed)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                }
            }
        }
    }
}