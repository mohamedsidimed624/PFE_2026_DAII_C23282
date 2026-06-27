FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN (mvn clean package -DskipTests -B || true) && \
    echo "=== DEBUG mvn -v ===" && mvn -v && \
    echo "=== DEBUG Specialite.java ===" && cat -A src/main/java/com/onmm/backend/entity/Specialite.java | head -20 && \
    echo "=== DEBUG lombok jar on classpath ===" && find /root/.m2 -iname "lombok*.jar" && \
    exit 1

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
