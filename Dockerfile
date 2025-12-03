# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built application
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

# Install production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Run database migrations
RUN npx prisma generate

# Start the application (run migrations in production before starting)
CMD ["sh", "-lc", "npx prisma migrate deploy && node dist/main.js"]
