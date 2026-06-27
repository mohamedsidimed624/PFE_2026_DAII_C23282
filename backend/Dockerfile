FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN (mvn clean package -DskipTests -B || true) && \
    echo "=== DEBUG direct javac test ===" && \
    mkdir -p /tmp/out && \
    LOMBOK_JAR=$(find /root/.m2 -iname "lombok-1.18.42.jar" | head -1) && \
    CP=$(find /root/.m2 -name "*.jar" | tr '\n' ':') && \
    javac -cp "$CP" -processorpath "$LOMBOK_JAR" -d /tmp/out \
      src/main/java/com/onmm/backend/entity/Specialite.java \
      src/main/java/com/onmm/backend/entity/SousSpecialite.java 2>&1 || true && \
    echo "=== DEBUG javap output ===" && \
    (javap -p /tmp/out/com/onmm/backend/entity/Specialite.class 2>&1 || echo "CLASS FILE NOT FOUND") && \
    exit 1

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
