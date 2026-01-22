# 🎉 OCPP CSMS Simulator - Setup Complete!

Your OCPP 1.6 Central System Management System simulator is ready to use!

## ✅ What's Been Created

### Server Components
- **WebSocket Server** (Port 9000) - Accepts OCPP 1.6 connections
- **Next.js Web UI** (Port 3000) - Management interface
- **In-Memory Store** - Logs and configurations
- **OCPP Handlers** - All core OCPP 1.6 actions supported

### Features Implemented
✅ Full OCPP 1.6 Core Profile support
✅ Real-time activity logging
✅ Configurable custom responses per charge point
✅ Server-to-client command sending
✅ Auto-refresh logs
✅ Connection monitoring
✅ Clean, responsive UI

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run server
```

This starts both:
- Web UI: http://localhost:3000
- WebSocket: ws://localhost:9000

### 2. Test with the Included Client
```bash
node test-client.js CP001
```

### 3. Access the Web UI
Open http://localhost:3000 in your browser to:
- View real-time logs
- Configure custom responses
- Send commands to charge points
- Monitor connections

## 📡 Connect Your OCPP Client

Connect to:
```
ws://localhost:9000/{chargePointId}
```

With subprotocol: `ocpp1.6`

Example URL: `ws://localhost:9000/CP001`

## 📋 Supported OCPP Actions

### Client → Server (Auto-handled)
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

### Server → Client (Send via UI)
- RemoteStartTransaction
- RemoteStopTransaction
- UnlockConnector
- Reset
- ChangeConfiguration
- GetConfiguration
- ClearCache
- ChangeAvailability
- TriggerMessage

## 📁 Project Structure

```
ocpp-csms-simulator/
├── app/
│   ├── api/
│   │   ├── ocpp/[[...path]]/route.ts    # OCPP endpoint
│   │   ├── logs/route.ts                # Logs API
│   │   ├── config/route.ts              # Config API
│   │   ├── send/[action]/route.ts       # Send commands API
│   │   └── connections/route.ts         # Connections API
│   ├── layout.tsx
│   ├── page.tsx                         # Main UI
│   └── globals.css
├── components/
│   ├── LogTable.tsx                     # Logs display
│   ├── ConfigForm.tsx                   # Config form
│   └── SendCommandForm.tsx              # Send commands
├── lib/
│   ├── store.ts                         # In-memory storage
│   └── ocpp-handlers.ts                 # OCPP logic
├── server.ts                            # WebSocket + Next.js server
├── test-client.js                       # Test client script
├── README.md                            # Main documentation
├── TESTING.md                           # Testing guide
└── package.json
```

## 🧪 Testing

See [TESTING.md](TESTING.md) for detailed testing instructions including:
- Using wscat for quick tests
- Node.js client examples
- Python client examples
- OCPP message format reference

## 🔧 Configuration

### Change Ports
Edit [server.ts](server.ts):
```typescript
const port = 3000;      // Web UI port
const wsPort = 9000;    // WebSocket port
```

### Customize Responses
Use the web UI:
1. Go to "Configure Responses" tab
2. Select charge point and action
3. Enter custom JSON response
4. Responses persist until server restart

## 📊 Monitoring

The web UI provides:
- **Real-time logs** with auto-refresh
- **Connection status** showing active charge points
- **Message details** with full payload/response
- **Color-coded events** (Connect/Disconnect/In/Out)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 9000
killall -9 node tsx
```

### Connection Refused
- Verify server is running: `npm run server`
- Check firewall settings
- Ensure correct WebSocket subprotocol: `ocpp1.6`

### No Logs Appearing
- Check browser console for errors
- Verify auto-refresh is enabled
- Manually click "Refresh" button

## 📚 Resources

- [OCPP 1.6 Specification](https://www.openchargealliance.org/protocols/ocpp-16/)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)

## 🎯 Next Steps

1. **Test Basic Connection**
   ```bash
   node test-client.js CP001
   ```

2. **Monitor in Web UI**
   - Open http://localhost:3000
   - Watch logs appear in real-time

3. **Configure Custom Responses**
   - Try rejecting an Authorize request
   - Return custom transaction IDs

4. **Send Commands**
   - Try RemoteStartTransaction
   - Test Reset command

5. **Integrate with Your Client**
   - Update your OCPP client to connect to ws://localhost:9000
   - Test all message flows

## 💡 Tips

- Use unique charge point IDs for each connection
- Message IDs must be unique per request
- Check logs for troubleshooting
- Configure responses before connecting client
- Use the test client to verify simulator behavior

## 🤝 Contributing

Feel free to extend the simulator:
- Add more OCPP actions
- Implement database persistence
- Add authentication
- Create additional UI features

## 📝 License

MIT License - Feel free to use and modify!

---

**Happy Testing! 🚗⚡**

For questions or issues, check the logs or review the documentation files.
