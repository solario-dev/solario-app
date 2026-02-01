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

                            JsonDocument doc = JsonDocument.Parse(msg);
                            var root = doc.RootElement;

                            if (!root.TryGetProperty("type", out var typeProp))
                            return;

                            var type = typeProp.GetString();

                            if (type == "input")
                            {
                                var input = JsonSerializer.Deserialize<PlayerInput>(msg);

                                if (input != null && int.TryParse(input.PlayerId, out var pid))
                                {
<<<<<<< HEAD
                                    // Tutaj normalnie pobralibyśmy skin gracza z bazy danych
                                    // Na ten moment inicjujemy z 'default' lub tym co już jest w symulacji
                                    _simulationService.InitPlayer(pid, 0, 0, 0, 0, 1, "default"); 
=======
                                    selfPlayerId = pid;
                                    _simulationService.ApplyPlayerInput(pid, input);
>>>>>>> 51cbe0e (Pytania, Update Websocketa, Podstawowa logika quizu + statek porusza się razem z planetą)
                                }
                            }
                            else if (type == "enter_quiz")
                            {
                                var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg);

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
                                var cmd = JsonSerializer.Deserialize<PlayerCommand>(msg);

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