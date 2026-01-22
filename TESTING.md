# Testing the OCPP CSMS Simulator

## Using wscat (Simple Testing)

Install wscat globally:
```bash
npm install -g wscat
```

Connect to the simulator:
```bash
wscat -c ws://localhost:9000/CP001 -s ocpp1.6
```

### Test Messages

Once connected, send these OCPP 1.6 messages:

**1. BootNotification**
```json
[2,"unique-id-1","BootNotification",{"chargePointVendor":"TestVendor","chargePointModel":"TestModel"}]
```

**2. Heartbeat**
```json
[2,"unique-id-2","Heartbeat",{}]
```

**3. Authorize**
```json
[2,"unique-id-3","Authorize",{"idTag":"RFID12345"}]
```

**4. StatusNotification**
```json
[2,"unique-id-4","StatusNotification",{"connectorId":1,"errorCode":"NoError","status":"Available"}]
```

**5. StartTransaction**
```json
[2,"unique-id-5","StartTransaction",{"connectorId":1,"idTag":"RFID12345","meterStart":0,"timestamp":"2026-01-21T12:00:00Z"}]
```

**6. MeterValues**
```json
[2,"unique-id-6","MeterValues",{"connectorId":1,"meterValue":[{"timestamp":"2026-01-21T12:05:00Z","sampledValue":[{"value":"1000","unit":"Wh"}]}]}]
```

**7. StopTransaction**
```json
[2,"unique-id-7","StopTransaction",{"transactionId":12345,"idTag":"RFID12345","meterStop":5000,"timestamp":"2026-01-21T12:30:00Z"}]
```

## Using a Custom OCPP Client

### Node.js Example

```javascript
const WebSocket = require('ws');

const chargePointId = 'CP001';
const ws = new WebSocket(`ws://localhost:9000/${chargePointId}`, 'ocpp1.6');

ws.on('open', () => {
  console.log('Connected to CSMS');
  
  // Send BootNotification
  const bootNotification = [
    2,
    "msg-" + Date.now(),
    "BootNotification",
    {
      chargePointVendor: "MyVendor",
      chargePointModel: "Model1"
    }
  ];
  
  ws.send(JSON.stringify(bootNotification));
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  const message = JSON.parse(data.toString());
  
  if (message[0] === 3) {
    console.log('Response:', message[2]);
  }
});

ws.on('close', () => {
  console.log('Disconnected');
});
```

### Python Example

```python
import websocket
import json
import time

def on_message(ws, message):
    print(f"Received: {message}")
    data = json.loads(message)
    if data[0] == 3:
        print(f"Response: {data[2]}")

def on_open(ws):
    print("Connected to CSMS")
    
    # Send BootNotification
    boot_notification = [
        2,
        f"msg-{int(time.time())}",
        "BootNotification",
        {
            "chargePointVendor": "MyVendor",
            "chargePointModel": "Model1"
        }
    ]
    ws.send(json.dumps(boot_notification))
    
    # Send Heartbeat after 2 seconds
    time.sleep(2)
    heartbeat = [2, f"msg-{int(time.time())}", "Heartbeat", {}]
    ws.send(json.dumps(heartbeat))

if __name__ == "__main__":
    charge_point_id = "CP001"
    ws_url = f"ws://localhost:9000/{charge_point_id}"
    
    ws = websocket.WebSocketApp(
        ws_url,
        header=["Sec-WebSocket-Protocol: ocpp1.6"],
        on_message=on_message,
        on_open=on_open
    )
    
    ws.run_forever()
```

## Understanding OCPP JSON-RPC Format

OCPP uses JSON-RPC 2.0 over WebSocket. The message format is:

### CALL (Client to Server)
```json
[MessageType, MessageId, Action, Payload]
[2, "unique-id", "ActionName", {...}]
```

### CALLRESULT (Response)
```json
[MessageType, MessageId, Payload]
[3, "unique-id", {...}]
```

### CALLERROR (Error Response)
```json
[MessageType, MessageId, ErrorCode, ErrorDescription, ErrorDetails]
[4, "unique-id", "InternalError", "Something went wrong", {}]
```

## Sending Commands from CSMS

Once a charge point is connected, you can send server-initiated commands via the web UI at http://localhost:3000

Common commands:
- **RemoteStartTransaction**: Start charging remotely
- **RemoteStopTransaction**: Stop charging remotely
- **Reset**: Reboot the charge point
- **GetConfiguration**: Get configuration values
- **ChangeConfiguration**: Change configuration values
- **UnlockConnector**: Unlock a connector
- **ClearCache**: Clear authorization cache

## Troubleshooting

### Connection Issues
- Ensure the server is running: `npm run server`
- Check ports 3000 (web UI) and 9000 (WebSocket) are not in use
- Verify WebSocket subprotocol is set to `ocpp1.6`

### Invalid Messages
- Ensure JSON is valid
- Use correct OCPP JSON-RPC format: `[MessageType, MessageId, Action, Payload]`
- MessageType: 2 for CALL, 3 for CALLRESULT, 4 for CALLERROR
- MessageId must be unique per request

### No Response
- Check the logs in the web UI
- Verify the action name is correct and supported
- Check server console for errors

## Next Steps

1. **Configure Custom Responses**: Use the web UI to set custom responses for specific actions
2. **Monitor Activity**: Watch real-time logs to see all OCPP messages
3. **Test Error Scenarios**: Configure error responses to test error handling
4. **Send Commands**: Test server-initiated commands like RemoteStart
