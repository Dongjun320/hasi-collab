FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xss512k"

ENTRYPOINT ["java", "-jar", "app.jar"]
