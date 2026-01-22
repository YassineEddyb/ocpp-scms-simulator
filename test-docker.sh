#!/bin/bash

echo "🧪 Testing OCPP CSMS Simulator in Docker"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if container is running
if ! docker ps | grep -q ocpp-csms-simulator; then
    echo "⚠️  Container not running. Starting with docker-compose..."
    docker-compose up -d
    echo "⏳ Waiting for container to be ready..."
    sleep 5
fi

echo "✅ Container is running"
echo ""

# Test Web UI
echo "📊 Testing Web UI (http://localhost:9090)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9090 | grep -q "200"; then
    echo "✅ Web UI is accessible"
else
    echo "❌ Web UI is not accessible"
    exit 1
fi

# Test API endpoints
echo ""
echo "🔌 Testing API endpoints..."

# Test logs endpoint
if curl -s http://localhost:9090/api/logs | grep -q "logs"; then
    echo "✅ Logs API working"
else
    echo "❌ Logs API failed"
    exit 1
fi

# Test connections endpoint
if curl -s http://localhost:9090/api/connections | grep -q "connections"; then
    echo "✅ Connections API working"
else
    echo "❌ Connections API failed"
    exit 1
fi

# Test WebSocket connection
echo ""
echo "🔌 Testing WebSocket OCPP connection..."

node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9000/TEST_CP', 'ocpp1.6');

ws.on('open', () => {
    console.log('✅ WebSocket connected');
    const bootNotification = [2, '1', 'BootNotification', {
        chargePointVendor: 'TestVendor',
        chargePointModel: 'TestModel'
    }];
    ws.send(JSON.stringify(bootNotification));
});

ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    if (response[0] === 3 && response[2].status === 'Accepted') {
        console.log('✅ Received valid BootNotification response');
        ws.close();
        process.exit(0);
    } else {
        console.log('❌ Invalid response');
        process.exit(1);
    }
});

ws.on('error', (error) => {
    console.log('❌ WebSocket error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('❌ Timeout waiting for response');
    process.exit(1);
}, 5000);
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed!"
    echo ""
    echo "📝 Summary:"
    echo "   - Web UI: http://localhost:9090"
    echo "   - WebSocket: ws://localhost:9000/{chargePointId}"
    echo "   - Container: $(docker ps --filter name=ocpp-csms-simulator --format '{{.Status}}')"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop: docker-compose down"
else
    echo ""
    echo "❌ Tests failed"
    exit 1
fi
