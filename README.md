# OCPP CSMS Simulator

A complete OCPP 1.6 Central System Management System (CSMS) simulator built with Next.js 15 and WebSockets. Perfect for testing OCPP charge point clients.

![OCPP Version](https://img.shields.io/badge/OCPP-1.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **🎉 Ready to use!** The simulator is now set up and running. See [GETTING_STARTED.md](GETTING_STARTED.md) for complete instructions.

## Features

- ✅ **Full OCPP 1.6 Support** - All core profile messages
- 🔌 **WebSocket Server** - Accepts connections from charge point clients
- 📊 **Real-time Logging** - Monitor all OCPP messages in real-time
- ⚙️ **Configurable Responses** - Customize responses per charge point and action
- 📤 **Send Commands** - Initiate server-to-client commands (RemoteStart, Reset, etc.)
- 🎯 **Simple UI** - Clean interface to manage everything

## Quick Start

### Option 1: Run with Docker (Recommended)

```bash
# Build and start
docker-compose up -d

# Test
./test-docker.sh

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

### Option 2: Run Locally

```bash
# Install dependencies
npm install

# Start the server
npm run server
```

This starts:
- Next.js web UI on `http://localhost:3000`
- OCPP WebSocket server on `ws://localhost:9000`

### 3. Connect Your OCPP Client

Connect your charge point to:
```
ws://localhost:9000/{chargePointId}
```

Example: `ws://localhost:9000/CP001`

### 4. Test OCPP Messages

Send standard OCPP 1.6 messages like:

**BootNotification:**
```json
[2, "1", "BootNotification", {
  "chargePointVendor": "VendorX",
  "chargePointModel": "Model1"
}]
```

**Heartbeat:**
```json
[2, "2", "Heartbeat", {}]
```

**Authorize:**
```json
[2, "3", "Authorize", {
  "idTag": "RFID123"
}]
```

## Supported OCPP Actions

### Client-to-Server (Handled automatically):
- BootNotification
- Heartbeat
- StatusNotification
- Authorize
- StartTransaction
- StopTransaction
- MeterValues
- DiagnosticsStatusNotification
- DataTransfer
- FirmwareStatusNotification

### Server-to-Client (Send via UI):
- RemoteStartTransaction
- RemoteStopTransaction
- UnlockConnector
- Reset
- ChangeConfiguration
- GetConfiguration
- ClearCache
- ChangeAvailability
- TriggerMessage

## Usage

### Monitor Logs
1. Open `http://localhost:3000`
2. View the **Logs** tab to see all OCPP messages in real-time
3. See connection events, incoming messages, and responses

### Configure Custom Responses
1. Go to **Configure Responses** tab
2. Select charge point ID and OCPP action
3. Enter custom JSON response
4. The simulator will use this response instead of defaults

Example custom response for `Authorize`:
```json
{
  "idTagInfo": {
    "status": "Blocked",
    "expiryDate": "2026-12-31T23:59:59Z"
  }
}
```

### Send Commands to Charge Points
1. Go to **Send Commands** tab
2. Select a connected charge point
3. Choose command (e.g., RemoteStartTransaction)
4. Enter payload and send

Example RemoteStartTransaction:
```json
{
  "connectorId": 1,
  "idTag": "USER123"
}
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Web UI (Port 3000)      │
│  - View logs                            │
│  - Configure responses                  │
│  - Send commands                        │
└─────────────────────────────────────────┘
                    │
                    │ HTTP API
                    ▼
┌─────────────────────────────────────────┐
│         In-Memory Store                 │
│  - Logs                                 │
│  - Configurations                       │
│  - Active connections                   │
└─────────────────────────────────────────┘
                    │
                    │
                    ▼
┌─────────────────────────────────────────┐
│  OCPP RPC Server (Port 9000)            │
│  - WebSocket endpoint                   │
│  - OCPP 1.6 message handling            │
│  - Auto JSON-RPC parsing                │
└─────────────────────────────────────────┘
                    │
                    │ WebSocket
                    ▼
        ┌───────────────────────┐
        │  Charge Point Clients │
        └───────────────────────┘
```

## File Structure

```
├── app/
│   ├── api/
│   │   ├── ocpp/[[...path]]/route.ts   # OCPP endpoint info
│   │   ├── logs/route.ts               # Get/clear logs
│   │   ├── config/route.ts             # Manage configurations
│   │   ├── send/[action]/route.ts      # Send commands
│   │   └── connections/route.ts        # List connections
│   ├── layout.tsx
│   └── page.tsx                        # Main UI
├── components/
│   ├── LogTable.tsx                    # Display logs
│   ├── ConfigForm.tsx                  # Configure responses
│   └── SendCommandForm.tsx             # Send commands UI
├── lib/
│   ├── store.ts                        # In-memory storage
│   └── ocpp-handlers.ts                # OCPP message handlers
└── server.js                           # WebSocket + Next.js server
```

## Development

```bash
# Development mode
npm run server

# Build for production
npm run build
npm start

# Lint
npm run lint
```

## Testing with `wscat`

Install wscat:
```bash
npm install -g wscat
```

Connect and test:
```bash
wscat -c ws://localhost:9000/CP001 -s ocpp1.6

# Send BootNotification
> [2,"1","BootNotification",{"chargePointVendor":"Test","chargePointModel":"Model1"}]

# Send Heartbeat
> [2,"2","Heartbeat",{}]
```

## Environment Variables

No environment variables required. Everything runs locally.

To change ports, edit `server.js`:
- `port`: Next.js web UI port (default: 3000)
- `wsPort`: OCPP WebSocket port (default: 9000)

## License

MIT

## Credits

Built with:
- [Next.js 15](https://nextjs.org/)
- [ws (WebSocket library)](https://github.com/websockets/ws)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
# ocpp-scms-simulator
