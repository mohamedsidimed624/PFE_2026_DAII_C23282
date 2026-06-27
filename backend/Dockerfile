FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
ENV MAVEN_OPTS="-Xmx2g"
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B -Dmaven.compiler.fork=true -Dmaven.compiler.meminitial=512m -Dmaven.compiler.maxmem=2048m

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
