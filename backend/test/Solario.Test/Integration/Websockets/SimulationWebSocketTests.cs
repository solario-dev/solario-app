using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace Solario.Test.Integration.Websockets;

public class SimulationWebSocketTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public SimulationWebSocketTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task WebSocket_ConnectsAndProcessesInput()
    {
        var wsClient = _factory.Server.CreateWebSocketClient();
        var uri = new Uri(_factory.Server.BaseAddress, "simulations/socket");
        uri = new Uri(uri.ToString().Replace("http", "ws"));

        using var ws = await wsClient.ConnectAsync(uri, CancellationToken.None);

        ws.State.Should().Be(WebSocketState.Open);

        var inputMsg = new 
        { 
            Type = "input", 
            PlayerId = "test_ws_player", 
            Keys = new { Forward = true } 
        };
        var inputJson = JsonSerializer.Serialize(inputMsg);
        var inputBytes = Encoding.UTF8.GetBytes(inputJson);
        
        await ws.SendAsync(new ArraySegment<byte>(inputBytes), WebSocketMessageType.Text, true, CancellationToken.None);

        var buffer = new byte[1024 * 8];
        bool found = false;

        for (int i = 0; i < 10; i++)
        {
            var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            var responseJson = Encoding.UTF8.GetString(buffer, 0, result.Count);
            
            if (responseJson.Contains("test_ws_player"))
            {
                found = true;
                break;
            }
        }

        found.Should().BeTrue();

        var enterQuizMsg = new { Type = "enter_quiz", PlayerId = "test_ws_player", Planet = "Mars" };
        await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(enterQuizMsg))), WebSocketMessageType.Text, true, CancellationToken.None);
        
        var leaveQuizMsg = new { Type = "leave_quiz", PlayerId = "test_ws_player" };
        await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(leaveQuizMsg))), WebSocketMessageType.Text, true, CancellationToken.None);

        await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Test done", CancellationToken.None);
    }
}