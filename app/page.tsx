"use client";

import ConfigForm from "@/components/ConfigForm";
import LogTable from "@/components/LogTable";
import SendCommandForm from "@/components/SendCommandForm";
import { LogEntry } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "config" | "send">(
    "logs",
  );
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    }
  };

  const clearLogs = async () => {
    if (confirm("Are you sure you want to clear all logs?")) {
      await fetch("/api/logs", { method: "DELETE" });
      fetchLogs();
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchConnections();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
        fetchConnections();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            OCPP CSMS Simulator
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            WebSocket Endpoint:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              ws://localhost:9000/{"{chargePointId}"}
            </code>
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold">Connected:</span>{" "}
              <span className="text-green-600 font-bold">
                {connections.length}
              </span>
            </div>
            {connections.length > 0 && (
              <div className="text-xs text-gray-600">
                [{connections.join(", ")}]
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "logs"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📋 Logs
              </button>
              <button
                onClick={() => setActiveTab("config")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "config"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ⚙️ Configure Responses
              </button>
              <button
                onClick={() => setActiveTab("send")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "send"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📤 Send Commands
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "logs" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Activity Logs</h2>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded"
                      />
                      Auto-refresh
                    </label>
                    <button
                      onClick={clearLogs}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Clear Logs
                    </button>
                    <button
                      onClick={fetchLogs}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                <LogTable logs={logs} />
              </div>
            )}

            {activeTab === "config" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Configure Custom Responses
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Set custom responses for specific charge points and OCPP
                  actions. These will override the default responses.
                </p>
                <div className="max-w-2xl">
                  <ConfigForm onSave={fetchLogs} />
                </div>
              </div>
            )}

            {activeTab === "send" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Send Commands to Charge Points
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Send server-initiated commands (e.g., RemoteStartTransaction)
                  to connected charge points.
                </p>
                <div className="max-w-2xl">
                  <SendCommandForm connections={connections} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📘 Quick Start</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              1. Start the WebSocket server:{" "}
              <code className="bg-blue-100 px-2 py-0.5 rounded">
                npm run server
              </code>
            </li>
            <li>
              2. Connect your OCPP client to:{" "}
              <code className="bg-blue-100 px-2 py-0.5 rounded">
                ws://localhost:9000/CP001
              </code>
            </li>
            <li>
              3. Send BootNotification, Heartbeat, or other OCPP 1.6 messages
            </li>
            <li>4. Monitor logs in real-time and configure custom responses</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
