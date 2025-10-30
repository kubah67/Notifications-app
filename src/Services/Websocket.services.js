import type { ServerWebSocket } from 'bun';

export interface WebSocketData {
  userId?: string;
  role?: string;
}

export class WebSocketService {
  private connections: Set<ServerWebSocket<WebSocketData>> = new Set();

  addConnection(ws: ServerWebSocket<WebSocketData>): void {
    this.connections.add(ws);
  }

  removeConnection(ws: ServerWebSocket<WebSocketData>): void {
    this.connections.delete(ws);
  }

  broadcast(message: any, excludeWs?: ServerWebSocket<WebSocketData>): void {
    const messageString = JSON.stringify(message);
    
    this.connections.forEach(ws => {
      if (ws !== excludeWs && ws.readyState === 1) {
        ws.send(messageString);
      }
    });
  }

  broadcastToUser(userId: string, message: any): void {
    const messageString = JSON.stringify(message);
    
    this.connections.forEach(ws => {
      if (ws.data.userId === userId && ws.readyState === 1) {
        ws.send(messageString);
      }
    });
  }

  broadcastEventUpdate(event: any, action: string): void {
    this.broadcast({
      type: 'EVENT_UPDATE',
      action,
      event,
      timestamp: new Date().toISOString()
    });
  }

  broadcastRSVPUpdate(rsvp: any, action: string): void {
    this.broadcast({
      type: 'RSVP_UPDATE',
      action,
      rsvp,
      timestamp: new Date().toISOString()
    });
  }
}￼Enter
