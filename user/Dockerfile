# === STAGE 1: Build Stage ===
FROM maven:3.8.5-openjdk-17-slim AS builder
WORKDIR /build

# Cache dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the application
COPY src ./src
RUN mvn clean install

# === STAGE 2: Runtime Stage ===
FROM openjdk:17-jdk-alpine AS runtime

WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -S appuser && adduser -S -G appuser -s /sbin/nologin appuser

# Copy the built JAR from the builder stage
COPY --from=builder /build/target/user-0.0.1-SNAPSHOT.jar app.jar

# Change ownership to the non-root user
RUN chown appuser:appuser /app/app.jar

# Switch to the non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Set the entry point to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
