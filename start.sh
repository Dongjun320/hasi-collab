#!/bin/bash

# 아래는 프로젝트 초기 세팅용 Bash 스크립트입니다.
# Git Bash로 돌리거나 IDE 기본 터미널이 Bash로 되어있는지 확인 바라요

# Bash PATH variable 설정
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Docker Compose 실행
docker compose up -d
# Root의 .package.json
npm install
# app/client/의 .package.json
cd "$ROOT_DIR/app/client" && npm install
# app/service/의 maven clean(기존 target/ 제거)으로 백그라운드에서(&) 돌리기
cd "$ROOT_DIR/app/service" && ./mvnw clean spring-boot:run &
# app/messenger/의 maven clean(기존 target/ 제거)으로 백그라운드에서(&) 돌리기
cd "$ROOT_DIR/app/messenger" && ./mvnw clean spring-boot:run &
# app/client/의 npm run dev 돌리기
cd "$ROOT_DIR/app/client" && npm run dev
