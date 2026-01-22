Create a Next.js 15 app for OCPP CSMS simulator using `ocpp-rpc` npm library:

## Backend Setup (`app/api/ocpp/[[...path]]/route.ts`)
```ts
import { RPCServer } from 'ocpp-rpc';

const server = new RPCServer({
  protocols: ['ocpp1.6'],
  strictMode: true
});

// Store connections
const connections = new Map<string, any>();

server.on('client', (client) => {
  const chargePointId = client.identity;
  connections.set(chargePointId, client);
  
  // Log connection
  logEvent(chargePointId, 'CONNECT', null, null);
  
  client.on('call', (method, params, uniqueId) => {
    logEvent(chargePointId, 'IN', method, params);
  });
  
  client.on('disconnect', () => {
    connections.delete(chargePointId);
  });
});

// Handle core OCPP 1.6 actions
server.handle('BootNotification', ({params}) => {
  logEvent(params.chargePointIdentity, 'BootNotification', params, {status: 'Accepted'});
  return { status: 'Accepted', currentTime: new Date().toISOString(), interval: 300 };
});

server.handle('Heartbeat', ({params}) => {
  return { currentTime: new Date().toISOString() };
});

// Configurable responses from database
server.handle('Authorize', async ({params}) => {
  const config = await getConfig('Authorize', params.chargePointIdentity);
  return config || { status: 'Accepted' };
});

Frontend stays the same (logs, config, send requests)
But backend becomes 10x simpler:

1. Use ocpp-rpc RPCServer instead of manual WebSocket parsing
2. `server.handle('ActionName', handler)` for each OCPP action
3. `client.call('RemoteStartTransaction', {idTag: '...', connectorId: 1})` for server-initiated
4. Automatic JSON-RPC parsing/validation

// Just implement these 8 handlers, ocpp-rpc handles the rest
server.handle('BootNotification', ...)
server.handle('Heartbeat', ...)
server.handle('StatusNotification', ...)
server.handle('Authorize', ...)
server.handle('StartTransaction', ...)
server.handle('StopTransaction', ...)
server.handle('MeterValues', ...)
server.handle('DiagnosticsStatusNotification', ...)

// From your /api/send endpoint
const client = connections.get(chargePointId);
await client.call('RemoteStartTransaction', {
  connectorId: 1,
  idTag: 'TEST123',
  meterStart: 0
});

app/api/ocpp/[[...path]]/route.ts     # ocpp-rpc server
app/api/config/route.ts              # Response configs
app/api/send/[action]/route.ts       # RemoteStart etc.
lib/ocpp-handlers.ts                 # All 10 handlers
components/LogTable.tsx              # Same as before
