FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN echo "=== DEBUG Specialite.java ===" && cat src/main/java/com/onmm/backend/entity/Specialite.java && echo "=== DEBUG mvn -v ===" && mvn -v
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
