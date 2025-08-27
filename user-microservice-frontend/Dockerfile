# Use the official Node.js image as the base image
FROM node:18-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /app

# Set the user to run the application
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
