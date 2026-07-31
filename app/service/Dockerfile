# syntax=docker/dockerfile:1
#
# 멀티스테이지: 호스트에 JDK/Maven 없이 Docker만으로 빌드됩니다.
#
# build 컨텍스트는 프로젝트 repo root 입니다. 이 모듈은 부모 pom(../../pom.xml)과
# docs/openapi/** 스펙 2개(openapi-generator-maven-plugin)를 참조하므로
# app/service/ 만으로는 빌드할 수 없습니다:
#
#   docker build -f app/service/Dockerfile -t hasi-service .
#
# 루트에는 mvnw가 없어(모듈별로만 존재) 빌드 스테이지는 maven 이미지를 씁니다.

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build

COPY pom.xml ./
COPY app/service/pom.xml app/service/
COPY app/messenger/pom.xml app/messenger/

COPY docs/openapi/ docs/openapi/
COPY app/service/src app/service/src

# -pl service -am: 부모 pom(packaging=pom) + service만 빌드. messenger는 빌드하지 않음.
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -pl app/service -am package -DskipTests

FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S spring && adduser -S -u 10001 -G spring spring

COPY --from=build /build/app/service/target/service-*.jar app.jar

USER spring
EXPOSE 8080

# 컨테이너 메모리 제한에 비례시키려면 -XX:MaxRAMPercentage=75.0 로 교체.
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xss512k"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
