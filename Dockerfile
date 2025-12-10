# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build only the API (web is deployed separately on Render)
RUN npm run --workspace=api build

# Generate Prisma client in the builder so the runtime artifacts
# are present in `node_modules` when copied to the final image.
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port the app runs on
EXPOSE 10000

# Set the working directory to the API
WORKDIR /app/apps/api

# Run database migrations at container start via entrypoint script (handles missing DB env)
# Copy entrypoint script and make it executable
COPY --from=builder /app/deploy/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Start the application via entrypoint which will run migrations (if configured) then start the server
CMD ["/bin/sh", "/app/docker-entrypoint.sh"]
