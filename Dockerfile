# Multi-stage build for production chaincode
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S chaincode && \
    adduser -S chaincode -u 1001 -G chaincode

# Copy dependencies and source
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY index.js ./
COPY lib/ ./lib/

# Set ownership
RUN chown -R chaincode:chaincode /app

# Switch to non-root user
USER chaincode

# Environment variables (override at runtime)
ENV CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999
ENV CHAINCODE_ID=""

# Expose chaincode port
EXPOSE 9999

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD nc -z localhost 9999 || exit 1

# Start chaincode server
CMD ["npm", "start"]
