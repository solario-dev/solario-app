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
            int selfPlayerId = 0;
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

                            // Parsowanie wstępne, żeby sprawdzić typ komunikatu
                            JsonDocument doc;
                            try
                            {
                                doc = JsonDocument.Parse(msg);
                            }
                            catch (JsonException)
                            {
                                _logger.LogWarning("Received invalid JSON");
                                continue; // Ignoruj błędne wiadomości, nie rozłączaj
                            }

                            var root = doc.RootElement;

                            // FIX: Sprawdź "Type" (PascalCase - frontend) oraz "type" (camelCase)
                            if (!root.TryGetProperty("Type", out var typeProp) && 
                                !root.TryGetProperty("type", out typeProp))
                            {
                                continue; // Nieznany format - ignoruj
                            }

                            var type = typeProp.GetString();

                            if (type == "input")
                            {
                                var input = JsonSerializer.Deserialize<PlayerInput>(msg, _jsonOptions);

                                if (input != null && int.TryParse(input.PlayerId, out var pid))
                                {
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
                                    int.TryParse(cmd.PlayerId, out var pid) &&
                                    !string.IsNullOrWhiteSpace(cmd.Planet))
                                {
                                    _logger.LogInformation("Player {PlayerId} entering quiz on {Planet}", pid, cmd.Planet);
                                    selfPlayerId = pid;
                                    _simulationService.EnterQuiz(pid, cmd.Planet);
                                }
                            }
                            else if (type == "leave_quiz")
                            {
                                var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg, _jsonOptions);

                                if (cmd != null && int.TryParse(cmd.PlayerId, out var pid))
                                {
                                    _logger.LogInformation("Player {PlayerId} leaving quiz", pid);
                                    selfPlayerId = pid;
                                    _simulationService.LeaveQuiz(pid);
                                }
                            }

                        }
                        catch (OperationCanceledException) { break; }
                        catch (WebSocketException) { cts.Cancel(); break; }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing WebSocket message");
                            // Nie przerywaj pętli przy błędzie aplikacji
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
                cts.Dispose();
                if (webSocket.State != WebSocketState.Closed)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                }
            }
        }
    }
}