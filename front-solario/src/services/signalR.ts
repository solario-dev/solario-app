import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export type PlanetPositionDto = { name: string; x: number; y: number; };

export function createGameHub(connectionUrl = "/gamehub") {
  const conn = new HubConnectionBuilder()
    .withUrl(connectionUrl)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  const start = async () => {
    if (conn.state === "Disconnected") await conn.start();
  };

  const stop = async () => {
    if (conn.state !== "Disconnected") await conn.stop();
  };

  const on = (event: string, cb: (...args: any[]) => void) => conn.on(event, cb);
  const off = (event: string, cb: (...args: any[]) => void) => conn.off(event, cb);
  const invoke = async (method: string, arg: any) => conn.invoke(method, arg);

  return { conn, start, stop, on, off, invoke };
}