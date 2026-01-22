FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build Next.js app
RUN npm run build

# Expose ports
EXPOSE 9090 9000

# Start the server
CMD ["npm", "run", "server"]
