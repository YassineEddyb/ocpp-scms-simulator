"use client";

import { useState } from "react";

interface ConfigFormProps {
  onSave: () => void;
}

export default function ConfigForm({ onSave }: ConfigFormProps) {
  const [chargePointId, setChargePointId] = useState("");
  const [action, setAction] = useState("BootNotification");
  const [response, setResponse] = useState('{\n  "status": "Accepted"\n}');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const actions = [
    "BootNotification",
    "Heartbeat",
    "StatusNotification",
    "Authorize",
    "StartTransaction",
    "StopTransaction",
    "MeterValues",
    "DiagnosticsStatusNotification",
    "DataTransfer",
    "FirmwareStatusNotification",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const responseObj = JSON.parse(response);

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargePointId,
          action,
          response: responseObj,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save configuration");
      }

      setSuccess("Configuration saved successfully!");
      onSave();

      // Reset form
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Invalid JSON or network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Charge Point ID
        </label>
        <input
          type="text"
          value={chargePointId}
          onChange={(e) => setChargePointId(e.target.value)}
          placeholder="e.g., CP001"
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">OCPP Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          {actions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Custom Response (JSON)
        </label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-800 rounded">{success}</div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Save Configuration
      </button>
    </form>
  );
}
