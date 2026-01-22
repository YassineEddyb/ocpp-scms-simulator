# Docker Deployment Guide

This guide explains how to run the OCPP CSMS Simulator using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

## Quick Start

### 1. Build and Start

```bash
docker-compose up -d
```

This will:
- Build the Docker image with Next.js app
- Start the container with both web UI and WebSocket server
- Expose ports 9090 (web) and 9000 (WebSocket)

### 2. Verify It's Running

```bash
./test-docker.sh
```

Or manually:
```bash
# Check container status
docker ps | grep ocpp-csms-simulator

# View logs
docker-compose logs -f

# Check health
docker inspect ocpp-csms-simulator | grep -A 5 "Health"
```

### 3. Access the Application

- **Web UI**: http://localhost:9090
- **WebSocket**: ws://localhost:9000/{chargePointId}

### 4. Stop the Container

```bash
docker-compose down
```

## Configuration

### Environment Variables

You can customize the ports and settings in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=9090           # Web UI port (optional)
  - WS_PORT=9000        # WebSocket port (optional)
  - HOSTNAME=0.0.0.0    # Bind address (optional)
```

### Port Mapping

To change exposed ports, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:9090"   # Map host port 8080 to container port 9090
  - "8000:9000"   # Map host port 8000 to container port 9000
```

## Testing

### Automated Test

Run the comprehensive test script:

```bash
./test-docker.sh
```

This tests:
- Docker is running
- Container is healthy
- Web UI is accessible
- API endpoints work
- WebSocket connection works
- OCPP message handling works

### Manual Testing

#### Test with curl

```bash
# Test web UI
curl http://localhost:9090

# Test API endpoints
curl http://localhost:9090/api/logs
curl http://localhost:9090/api/connections
```

#### Test WebSocket with Node.js

```bash
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9000/TEST_CP', 'ocpp1.6');
ws.on('open', () => {
  const msg = [2, '1', 'BootNotification', {
    chargePointVendor: 'Docker', 
    chargePointModel: 'Test'
  }];
  ws.send(JSON.stringify(msg));
});
ws.on('message', (data) => console.log('Response:', data.toString()));
"
```

## Logs and Monitoring

### View Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# View last 50 lines
docker-compose logs --tail=50

# View logs for specific service
docker logs ocpp-csms-simulator
```

### Container Stats

```bash
# Resource usage
docker stats ocpp-csms-simulator

# Inspect container
docker inspect ocpp-csms-simulator
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs

# Remove and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :9090
lsof -i :9000

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Container is Unhealthy

```bash
# Check health status
docker inspect ocpp-csms-simulator --format='{{json .State.Health}}'

# View health check logs
docker inspect ocpp-csms-simulator | grep -A 10 "Health"

# Restart container
docker-compose restart
```

### Connection Refused

1. Check container is running: `docker ps`
2. Check ports are mapped: `docker port ocpp-csms-simulator`
3. Check logs: `docker-compose logs`
4. Test from inside container:
   ```bash
   docker exec -it ocpp-csms-simulator wget -O- http://localhost:9090
   ```

## Production Deployment

### Build for Production

```bash
# Build optimized image
docker build -t ocpp-csms-simulator:latest .

# Run in production mode
docker run -d \
  --name ocpp-csms-simulator \
  -p 9090:9090 \
  -p 9000:9000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  ocpp-csms-simulator:latest
```

### Using Docker Hub

```bash
# Tag image
docker tag ocpp-csms-simulator:latest yourusername/ocpp-csms-simulator:latest

# Push to Docker Hub
docker push yourusername/ocpp-csms-simulator:latest

# Pull and run on other machines
docker pull yourusername/ocpp-csms-simulator:latest
docker run -d -p 9090:9090 -p 9000:9000 yourusername/ocpp-csms-simulator:latest
```

### Persisting Data

To persist logs and configurations across container restarts, add volumes:

```yaml
services:
  ocpp-csms-simulator:
    volumes:
      - ./data:/app/data
```

## Performance

### Container Resources

The container is lightweight:
- Image size: ~250MB
- Memory usage: ~100-200MB
- CPU usage: <1% idle, ~5% active

### Optimize Build

To reduce image size:

```dockerfile
# Use multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
CMD ["npm", "run", "server"]
```

## Networking

### Bridge Network

Access from host machine:
```
http://localhost:9090
ws://localhost:9000
```

### Docker Network

Connect other containers:
```bash
docker network create ocpp-network
docker-compose --network ocpp-network up -d
```

### External Access

To allow connections from outside the host:

```yaml
services:
  ocpp-csms-simulator:
    environment:
      - HOSTNAME=0.0.0.0
    ports:
      - "0.0.0.0:9090:9090"
      - "0.0.0.0:9000:9000"
```

## Health Checks

The container includes a built-in health check:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9090"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' ocpp-csms-simulator
```

## Cleanup

### Remove Everything

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi ocpp-csms-simulator-ocpp-csms-simulator

# Remove all unused Docker resources
docker system prune -a
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Test

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker-compose build
      - name: Run tests
        run: |
          docker-compose up -d
          ./test-docker.sh
          docker-compose down
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Run tests: `./test-docker.sh`
3. Check container health: `docker ps`
4. Review troubleshooting section above
