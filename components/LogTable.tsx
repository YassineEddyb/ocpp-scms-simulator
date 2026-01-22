"use client";

import { LogEntry } from "@/lib/store";

interface LogTableProps {
  logs: LogEntry[];
}

export default function LogTable({ logs }: LogTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "CONNECT":
        return "bg-green-100 text-green-800";
      case "DISCONNECT":
        return "bg-red-100 text-red-800";
      case "IN":
        return "bg-blue-100 text-blue-800";
      case "OUT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border text-left text-sm font-semibold">
              Time
            </th>
            <th className="px-4 py-2 border text-left text-sm font-semibold">
              Charge Point
            </th>
            <th className="px-4 py-2 border text-left text-sm font-semibold">
              Type
            </th>
            <th className="px-4 py-2 border text-left text-sm font-semibold">
              Action
            </th>
            <th className="px-4 py-2 border text-left text-sm font-semibold">
              Payload
            </th>
            <th className="px-4 py-2 border text-left text-sm font-semibold">
              Response
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No logs yet. Connect a charge point to see activity.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2 border text-sm font-mono">
                  {log.chargePointId}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(
                      log.type,
                    )}`}
                  >
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-2 border text-sm font-mono">
                  {log.action || "-"}
                </td>
                <td className="px-4 py-2 border text-xs">
                  <pre className="max-w-xs overflow-auto">
                    {log.payload ? JSON.stringify(log.payload, null, 2) : "-"}
                  </pre>
                </td>
                <td className="px-4 py-2 border text-xs">
                  <pre className="max-w-xs overflow-auto">
                    {log.response ? JSON.stringify(log.response, null, 2) : "-"}
                  </pre>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
