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

        public SimulationWebSocketHandler(SimulationService simulationService, ILogger<SimulationWebSocketHandler> logger)
        {
            _simulationService = simulationService;
            _logger = logger;
        }

        public async Task HandleAsync(WebSocket webSocket)
        {
            var buffer = new byte[4 * 1024];
            int selfPlayerId = 0;
            var cts = new CancellationTokenSource();

            _logger.LogInformation("WebSocket connection established");

            try
            {
                // Task do odbierania wiadomości od klienta (input)
                var receiveTask = Task.Run(async () =>
                {
                    while (webSocket.State == WebSocketState.Open && !cts.Token.IsCancellationRequested)
                    {
                        try
                        {
                            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cts.Token);

                            if (result.MessageType == WebSocketMessageType.Close)
                            {
                                _logger.LogInformation("WebSocket close message received");
                                cts.Cancel();
                                break;
                            }

                            var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                            var input = JsonSerializer.Deserialize<PlayerInput>(msg);

                            if (input != null && input.Type == "input" && int.TryParse(input.PlayerId, out var pid))
                            {
                                if (selfPlayerId != pid)
                                {
                                    _logger.LogInformation("Player {PlayerId} connected via WebSocket", pid);
                                }
                                selfPlayerId = pid;
                                _simulationService.ApplyPlayerInput(pid, input);
                            }
                        }
                        catch (OperationCanceledException)
                        {
                            break;
                        }
                        catch (WebSocketException ex)
                        {
                            _logger.LogWarning(ex, "WebSocket exception in receive task");
                            cts.Cancel();
                            break;
                        }
                    }
                }, cts.Token);

                // Task do wysyłania stanu co ~33ms (30 FPS)
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

                            await Task.Delay(33, cts.Token); // 30 FPS
                        }
                        catch (OperationCanceledException)
                        {
                            break;
                        }
                        catch (WebSocketException ex)
                        {
                            _logger.LogWarning(ex, "WebSocket exception in send task");
                            cts.Cancel();
                            break;
                        }
                    }
                }, cts.Token);

                // Czekaj aż oba zadania się zakończą
                await Task.WhenAny(receiveTask, sendTask);
                cts.Cancel();
                await Task.WhenAll(receiveTask, sendTask);
            }
            finally
            {
                _logger.LogInformation("WebSocket connection closed for player {PlayerId}", selfPlayerId);
                cts.Dispose();
                if (webSocket.State != WebSocketState.Closed)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                }
            }
        }
    }
}
