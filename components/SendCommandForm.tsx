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

  // Example payloads for each OCPP command
  const payloadExamples: Record<string, string> = {
    CancelReservation: '{\n  "reservationId": 1\n}',
    ChangeAvailability: '{\n  "connectorId": 1,\n  "type": "Operative"\n}',
    ChangeConfiguration: '{\n  "key": "HeartbeatInterval",\n  "value": "300"\n}',
    ClearCache: '{}',
    ClearChargingProfile: '{\n  "id": 1,\n  "connectorId": 1,\n  "chargingProfilePurpose": "TxProfile",\n  "stackLevel": 1\n}',
    DataTransfer: '{\n  "vendorId": "VendorX",\n  "messageId": "CustomMessage",\n  "data": "Optional data"\n}',
    GetCompositeSchedule: '{\n  "connectorId": 1,\n  "duration": 3600,\n  "chargingRateUnit": "W"\n}',
    GetConfiguration: '{\n  "key": ["HeartbeatInterval", "MeterValueSampleInterval"]\n}',
    GetDiagnostics: '{\n  "location": "ftp://example.com/diagnostics",\n  "retries": 3,\n  "retryInterval": 60\n}',
    GetLocalListVersion: '{}',
    RemoteStartTransaction: '{\n  "connectorId": 1,\n  "idTag": "TEST123"\n}',
    RemoteStopTransaction: '{\n  "transactionId": 12345\n}',
    ReserveNow: '{\n  "connectorId": 1,\n  "expiryDate": "2026-12-31T23:59:59Z",\n  "idTag": "TEST123",\n  "reservationId": 1\n}',
    Reset: '{\n  "type": "Soft"\n}',
    SendLocalList: '{\n  "listVersion": 1,\n  "updateType": "Full",\n  "localAuthorizationList": [\n    {\n      "idTag": "TEST123",\n      "idTagInfo": {\n        "status": "Accepted"\n      }\n    }\n  ]\n}',
    SetChargingProfile: '{\n  "connectorId": 1,\n  "csChargingProfiles": {\n    "chargingProfileId": 1,\n    "stackLevel": 1,\n    "chargingProfilePurpose": "TxProfile",\n    "chargingProfileKind": "Absolute",\n    "chargingSchedule": {\n      "chargingRateUnit": "W",\n      "chargingSchedulePeriod": [\n        {\n          "startPeriod": 0,\n          "limit": 32000\n        }\n      ]\n    }\n  }\n}',
    TriggerMessage: '{\n  "requestedMessage": "Heartbeat",\n  "connectorId": 1\n}',
    UnlockConnector: '{\n  "connectorId": 1\n}',
    UpdateFirmware: '{\n  "location": "ftp://example.com/firmware.bin",\n  "retrieveDate": "2026-12-31T23:59:59Z",\n  "retries": 3,\n  "retryInterval": 60\n}',
  };

  const serverActions = [
    "CancelReservation",
    "ChangeAvailability",
    "ChangeConfiguration",
    "ClearCache",
    "ClearChargingProfile",
    "DataTransfer",
    "GetCompositeSchedule",
    "GetConfiguration",
    "GetDiagnostics",
    "GetLocalListVersion",
    "RemoteStartTransaction",
    "RemoteStopTransaction",
    "ReserveNow",
    "Reset",
    "SendLocalList",
    "SetChargingProfile",
    "TriggerMessage",
    "UnlockConnector",
    "UpdateFirmware",
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
          onChange={(e) => {
            const newAction = e.target.value;
            setAction(newAction);
            // Update payload example when action changes
            if (payloadExamples[newAction]) {
              setPayload(payloadExamples[newAction]);
            }
          }}
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
