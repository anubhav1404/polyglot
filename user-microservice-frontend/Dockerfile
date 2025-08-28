# Use a specific version of Node.js for consistency
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

FROM node:18-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /app

COPY --from=builder /app ./

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
