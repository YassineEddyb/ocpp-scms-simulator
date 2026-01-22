// In-memory storage for logs and configurations
export interface LogEntry {
  id: string;
  chargePointId: string;
  timestamp: string;
  type: "CONNECT" | "DISCONNECT" | "IN" | "OUT";
  action: string | null;
  payload: any;
  response?: any;
}

export interface ResponseConfig {
  chargePointId: string;
  action: string;
  response: any;
}

class Store {
  private logs: LogEntry[] = [];
  private configs: Map<string, ResponseConfig> = new Map();
  private connections: Map<string, any> = new Map();

  // Logs
  addLog(entry: Omit<LogEntry, "id" | "timestamp">) {
    const log: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    this.logs.push(log);
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    return log;
  }

  getLogs(limit = 100) {
    return this.logs.slice(-limit).reverse();
  }

  clearLogs() {
    this.logs = [];
  }

  // Configs
  setConfig(chargePointId: string, action: string, response: any) {
    const key = `${chargePointId}:${action}`;
    this.configs.set(key, { chargePointId, action, response });
  }

  getConfig(chargePointId: string, action: string): any | null {
    const key = `${chargePointId}:${action}`;
    return this.configs.get(key)?.response || null;
  }

  getAllConfigs() {
    return Array.from(this.configs.values());
  }

  deleteConfig(chargePointId: string, action: string) {
    const key = `${chargePointId}:${action}`;
    this.configs.delete(key);
  }

  // Connections
  setConnection(chargePointId: string, client: any) {
    this.connections.set(chargePointId, client);
  }

  getConnection(chargePointId: string) {
    return this.connections.get(chargePointId);
  }

  deleteConnection(chargePointId: string) {
    this.connections.delete(chargePointId);
  }

  getAllConnections() {
    return Array.from(this.connections.keys());
  }
}

export const store = new Store();
