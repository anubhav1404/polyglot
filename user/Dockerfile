# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw clean package -DskipTests
 
# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 
COPY --chown=appuser:appgroup --from=build /app/target/user-0.0.1-SNAPSHOT.jar app.jar
 
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8080
