/**
 * Stands in for socket.io-client in the static demo build, which has no
 * server to connect to. The demo API broadcasts through it instead.
 */

type Handler = (data?: any) => void;

const sockets = new Set<FakeSocket>();

class FakeSocket {
  id = "demo";
  connected = true;
  private handlers = new Map<string, Set<Handler>>();

  constructor() {
    sockets.add(this);
    setTimeout(() => this.fire("connect"));
  }

  on(event: string, handler: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return this;
  }

  off(event: string, handler?: Handler) {
    if (handler) this.handlers.get(event)?.delete(handler);
    else this.handlers.delete(event);
    return this;
  }

  emit() {
    return this;
  }

  disconnect() {
    sockets.delete(this);
    this.connected = false;
    return this;
  }

  fire(event: string, data?: unknown) {
    this.handlers.get(event)?.forEach((handler) => handler(data));
  }
}

export type Socket = FakeSocket;

export const io = (..._args: unknown[]) => new FakeSocket();

export function broadcast(event: string, data?: unknown) {
  sockets.forEach((socket) => socket.fire(event, data));
}
