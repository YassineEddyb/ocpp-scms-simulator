"use client";

import { useState } from "react";

interface SendCommandFormProps {
  connections: string[];
}

export default function SendCommandForm({ connections }: SendCommandFormProps) {
  const [chargePointId, setChargePointId] = useState("");
  const [action, setAction] = useState("RemoteStartTransaction");
  const [payload, setPayload] = useState(
    '{\n  "connectorId": 1,\n  "idTag": "TEST123"\n}',
  );
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const serverActions = [
    "RemoteStartTransaction",
    "RemoteStopTransaction",
    "UnlockConnector",
    "Reset",
    "ChangeConfiguration",
    "GetConfiguration",
    "ClearCache",
    "ChangeAvailability",
    "TriggerMessage",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResponse("");
    setLoading(true);

    try {
      const payloadObj = JSON.parse(payload);

      const res = await fetch(`/api/send/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargePointId,
          payload: payloadObj,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send command");
      }

      setResponse(JSON.stringify(data.response, null, 2));
    } catch (err: any) {
      setError(err.message || "Invalid JSON or network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Charge Point ID
        </label>
        <select
          value={chargePointId}
          onChange={(e) => setChargePointId(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a connected charge point</option>
          {connections.map((cp) => (
            <option key={cp} value={cp}>
              {cp}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">OCPP Command</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          {serverActions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {response && (
        <div>
          <label className="block text-sm font-medium mb-1">Response:</label>
          <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto">
            {response}
          </pre>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || connections.length === 0}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Command"}
      </button>

      {connections.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          No charge points connected
        </p>
      )}
    </form>
  );
}
